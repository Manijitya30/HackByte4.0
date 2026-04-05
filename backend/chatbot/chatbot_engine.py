# ─────────────────────────────────────────────────────────────
#  Legal RAG Chatbot  —  rolling summary memory + enforced citations
# ─────────────────────────────────────────────────────────────

from dotenv import load_dotenv
import os, re, json, textwrap

load_dotenv()
my_key = os.getenv("GOOGLE_API_KEY")

from langchain_google_genai import GoogleGenerativeAIEmbeddings, ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_core.documents import Document
from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from pinecone import Pinecone
from pathlib import Path

# ── Config ────────────────────────────────────────────────────
PINECONE_API_KEY  = "pcsk_31WvWZ_LUEsUq4CJRox4QKq5bsjSL2ptpPCidb1TYPboZR7NgGS7VTJNmikiHnTEdWUxE8"
INDEX_NAME        = "hackbyte-tensor"
RECENT_TURNS      = 6
SUMMARY_THRESHOLD = 10
TOP_K_EACH        = 4

# ── LLM ───────────────────────────────────────────────────────
llm = ChatGoogleGenerativeAI(
    model="gemini-2.5-flash",
    google_api_key=my_key,
    temperature=0.3
)

embeddings = GoogleGenerativeAIEmbeddings(
    model="gemini-embedding-001",
    google_api_key=my_key,
    task_type="retrieval_document"
)

# ── Lazy Pinecone init ────────────────────────────────────────
_pc    = None
_index = None

def get_index():
    global _pc, _index
    if _index is None:
        print("Connecting to Pinecone...", end=" ", flush=True)
        _pc    = Pinecone(api_key=PINECONE_API_KEY)
        _index = _pc.Index(INDEX_NAME)
        print("connected.")
    return _index


# ─────────────────────────────────────────────────────────────
#  Document Loading & Chunking
# ─────────────────────────────────────────────────────────────

def load_and_chunk_statute(pdf_path: Path) -> list[Document]:
    source_name = pdf_path.stem
    pages       = PyPDFLoader(str(pdf_path)).load()
    full_text   = "\n".join(p.page_content for p in pages)

    splitter = RecursiveCharacterTextSplitter(
        chunk_size=1500, chunk_overlap=150,
        separators=["\nSection ", "\n\n", "\n", " ", ""],
    )

    documents, seen_ids = [], set()
    for i, chunk in enumerate(splitter.create_documents([full_text])):
        text = chunk.page_content.strip()
        if len(text) < 200:
            continue
        sec_match  = re.search(r'Section\s+(\d+[A-Z]?)', text)
        section_id = sec_match.group(1) if sec_match else str(i)
        doc_id     = f"{source_name}_S{section_id}"
        if doc_id in seen_ids:
            doc_id = f"{doc_id}_{i}"
        seen_ids.add(doc_id)
        documents.append(Document(
            page_content=text,
            metadata=dict(doc_id=doc_id, source=source_name, section=section_id,
                          type="statute", chunk_type="statute",
                          case_id="", court="", year="")
        ))
    return documents


def chunk_case(case: dict) -> list[Document]:
    case_id   = case.get("case_id", "unknown")
    title     = case.get("title", "Unknown Case")
    court     = case.get("court", "")
    year      = str(case.get("year", ""))
    header    = f"Case: {title} ({year})\nCourt: {court}\n"
    base_meta = dict(case_id=case_id, source=title, court=court,
                     year=year, type="judgment")
    chunks    = []

    for chunk_type, key in [("facts",       "facts"),
                             ("prosecution", "arguments_prosecution"),
                             ("defense",     "arguments_defense")]:
        content = case.get(key, "")
        if content and len(content) > 100:
            chunks.append(Document(
                page_content=f"{header}\n{chunk_type.title()}:\n{content}"[:2000],
                metadata={**base_meta,
                          "doc_id":     f"{case_id}_{chunk_type}",
                          "chunk_type": chunk_type}
            ))

    reasoning = case.get("reasoning", "")
    judgment  = case.get("judgment",  "")
    if reasoning or judgment:
        chunks.append(Document(
            page_content=f"{header}\nJudgment: {judgment}\nReasoning:\n{reasoning}"[:2000],
            metadata={**base_meta,
                      "doc_id":     f"{case_id}_judgment",
                      "chunk_type": "judgment"}
        ))
    return chunks


def upsert_documents(documents, batch_size=50, namespace="legal"):
    idx     = get_index()
    records = [{"id": d.metadata["doc_id"], "text": d.page_content, **d.metadata}
               for d in documents]
    for i in range(0, len(records), batch_size):
        idx.upsert_records(namespace=namespace, records=records[i:i+batch_size])
        print(f"  Inserted batch {i // batch_size + 1}")

# Uncomment to (re-)populate:
# pdf_folder   = Path("../dataset")
# statute_docs = [d for pdf in pdf_folder.glob("*.pdf") for d in load_and_chunk_statute(pdf)]
# with open("../dataset/cases.json") as f:
#     case_docs = [d for case in json.load(f) for d in chunk_case(case)]
# upsert_documents(statute_docs + case_docs)


# ─────────────────────────────────────────────────────────────
#  Source label builder
# ─────────────────────────────────────────────────────────────

def build_source_label(fields: dict) -> str:
    doc_type = fields.get("type", "")

    if doc_type == "statute":
        source  = fields.get("source", "Unknown Statute").replace("_", " ").title()
        section = fields.get("section", "")
        return f"📜 {source} — Section {section}" if section else f"📜 {source}"

    elif doc_type == "judgment":
        case_name  = fields.get("source",     "Unknown Case")
        case_id    = fields.get("case_id",    "")
        court      = fields.get("court",      "")
        year       = fields.get("year",       "")
        chunk_type = fields.get("chunk_type", "").title()
        parts = [f"⚖️  {case_name}"]
        if case_id:  parts.append(f"[{case_id}]")
        if court:    parts.append(f"| {court}")
        if year:     parts.append(f"({year})")
        if chunk_type: parts.append(f"— {chunk_type}")
        return " ".join(parts)

    return f"📄 {fields.get('doc_id', 'Unknown')}"


# ─────────────────────────────────────────────────────────────
#  Retrieval
# ─────────────────────────────────────────────────────────────

def retrieve(query: str, top_k: int = TOP_K_EACH,
             doc_type: str | None = None) -> list[dict]:
    idx    = get_index()
    params = {
        "namespace": "legal",
        "query": {"inputs": {"text": query}, "top_k": top_k}
    }
    if doc_type:
        params["query"]["filter"] = {"type": doc_type}

    hits = idx.search(**params)["result"]["hits"]
    return [
        {
            "text":   h["fields"].get("text", ""),
            "label":  build_source_label(h["fields"]),
            "fields": h["fields"],
        }
        for h in hits
    ]


def retrieve_all(query: str) -> dict:
    laws  = retrieve(query, doc_type="statute")
    cases = retrieve(query, doc_type="judgment")

    # Number ALL chunks globally so [1]..[N] are unique across laws + cases
    all_chunks = laws + cases
    numbered_laws  = []
    numbered_cases = []

    offset = 0
    for i, c in enumerate(laws):
        numbered_laws.append({**c, "n": i + 1})
        offset = i + 1
    for j, c in enumerate(cases):
        numbered_cases.append({**c, "n": offset + j + 1})

    def fmt(chunks):
        return "\n\n".join(
            f"[{c['n']}] {c['label']}\n{c['text']}"
            for c in chunks
        ) or "None found."

    # Build the reference legend shown to user
    legend = []
    for c in numbered_laws + numbered_cases:
        legend.append((c["n"], c["label"]))

    return {
        "laws_text":  fmt(numbered_laws),
        "cases_text": fmt(numbered_cases),
        "legend":     legend,           # list of (number, label)
    }


# ─────────────────────────────────────────────────────────────
#  Memory
# ─────────────────────────────────────────────────────────────

_summarise_prompt = ChatPromptTemplate.from_messages([
    ("system", """\
You are a legal memory distiller embedded inside a RAG chatbot.
Your summaries are NOT shown to the user — they are injected into future prompts
as background context to help the assistant answer follow-up questions accurately.

Your summary must be optimised for two purposes:
  1. Retrieval enrichment — future search queries will be blended with your summary,
     so it must contain the right legal keywords, section numbers, and case names.
  2. Conversational continuity — the assistant must be able to resolve pronouns
     ("the accused", "that section", "the same case") from your summary alone.
"""),
    ("human", """\
Distil the conversation below into a structured legal memory block.
Hard limit: 150 words total.

Use this exact format — do not add extra sections:

TOPIC: <one-line description of the legal issue(s) discussed>
ENTITIES: <comma-separated list of people, places, organisations mentioned>
STATUTES: <comma-separated list of Acts and section numbers cited, e.g. IPC s.378, s.420>
CASES: <comma-separated list of case names / IDs referenced>
CONCLUSIONS: <bullet points of key legal conclusions or positions established so far>
OPEN QUESTIONS: <bullet points of questions still unresolved or pending>

If a field has nothing to fill in, write "None".
Do NOT paraphrase or invent — only extract what is explicitly in the conversation.

Conversation:
{conversation}

Memory block:""")
])
_summarise_chain = _summarise_prompt | llm | StrOutputParser()


class ConversationMemory:

    def __init__(self):
        self.summary: str        = ""
        self.turns:   list[dict] = []

    def add(self, role: str, content: str):
        self.turns.append({"role": role, "content": content})
        if len(self.turns) > SUMMARY_THRESHOLD:
            self._compress()

    def build_context_string(self) -> str:
        parts = []
        if self.summary:
            parts.append(f"[Summary of earlier conversation]\n{self.summary}")
        recent = self.turns[-RECENT_TURNS:]
        if recent:
            parts.append("[Recent messages]")
            for t in recent:
                label = "User" if t["role"] == "user" else "Assistant"
                parts.append(f"{label}: {t['content']}")
        return "\n\n".join(parts) if parts else "No prior conversation."

    def enriched_query(self, user_message: str) -> str:
        if self.summary:
            return f"{self.summary}\n\nCurrent question: {user_message}"
        recent_user = [t["content"] for t in self.turns[-RECENT_TURNS:]
                       if t["role"] == "user"]
        if recent_user:
            return " ".join(recent_user[-3:]) + " " + user_message
        return user_message

    def reset(self):
        self.summary = ""
        self.turns   = []

    def stats(self) -> str:
        return (f"Total turns: {len(self.turns)} | "
                f"Summary exists: {'yes' if self.summary else 'no'} | "
                f"Verbatim turns in prompt: {min(len(self.turns), RECENT_TURNS)}")

    def _compress(self):
        old_turns  = self.turns[:-RECENT_TURNS]
        self.turns = self.turns[-RECENT_TURNS:]
        old_text   = "\n".join(
            f"{'User' if t['role'] == 'user' else 'Assistant'}: {t['content']}"
            for t in old_turns
        )
        if self.summary:
            old_text = (f"[Previous summary]\n{self.summary}\n\n"
                        f"[Additional turns]\n{old_text}")
        self.summary = _summarise_chain.invoke({"conversation": old_text})


# ─────────────────────────────────────────────────────────────
#  Role-aware system prompts
# ─────────────────────────────────────────────────────────────

_CITATION_RULES = """\

CITATION RULES — strictly follow these:
1. Every factual or legal claim MUST end with the source number(s) in square brackets,
   e.g. "Theft requires dishonest intention [1]." or "As held in State v. Ravi [3]."
2. If a point draws from multiple sources, cite all of them: "... [1][3]."
3. Do NOT make any legal statement without a citation.
4. If the retrieved sources do not cover a point, say explicitly:
   "This is not covered in the retrieved sources."
"""

ROLE_PROMPTS = {

    "citizen": """\
You are an expert legal assistant helping an ordinary citizen understand Indian law.

The user is not a legal professional — they may be unfamiliar with legal terminology,
section numbers, or court procedures. Your job is to help them understand their
situation clearly and practically.

Tone: plain, clear, reassuring. Avoid jargon where possible; when you must use a
legal term, briefly explain it in simple words.

Structure your response as:
1. Relevant Laws  — what the law says, explained in plain language
2. Relevant Cases — how courts have handled similar situations
3. Plain Answer   — a direct, practical answer to their question
""" + _CITATION_RULES,

    "lawyer": """\
You are an expert legal assistant advising a practising lawyer on Indian law.

The user is a legal professional. You do not need to simplify terminology or
explain basic concepts. Focus on precision, completeness, and practical utility.

Tone: precise, collegial, direct.

Structure your response as:
1. Applicable Statutes  — exact provisions, their scope, and any notable
                          judicial interpretation
2. Relevant Precedents  — binding and persuasive case law, with holdings
3. Strategic Analysis   — strengths and weaknesses of the legal position,
                          arguments available to each side, risks to flag
""" + _CITATION_RULES,

    "judge": """\
You are an expert legal assistant supporting a judge in analysing a legal question.

The user requires rigorous, impartial analysis — not advice to one side.
Examine the law from all angles. Surface tensions between provisions or precedents.
Identify the most defensible legal conclusion and explain your reasoning fully.

Tone: formal, measured, analytical.

Structure your response as:
1. Applicable Statutes     — the relevant provisions, their legislative intent,
                             and how courts have interpreted them
2. Relevant Precedents     — binding authorities, any conflicting lines of
                             judgment, and how courts have distinguished cases
3. Legal Analysis          — a balanced examination of the question, the
                             competing positions, and the most well-reasoned
                             conclusion supported by the sources
""" + _CITATION_RULES,
}
VALID_ROLES  = set(ROLE_PROMPTS.keys())
DEFAULT_ROLE = "citizen"


def get_system_prompt(role: str) -> str:
    return ROLE_PROMPTS.get(role.lower(), ROLE_PROMPTS[DEFAULT_ROLE])


_chat_prompt = ChatPromptTemplate.from_messages([
    ("system", "{system}"),
    ("human", """\
Conversation memory:
{memory}

Retrieved Statutes:
{laws}

Retrieved Cases:
{cases}

User's question: {question}

Remember: cite every claim with [n] inline. Do not skip citations.
"""),
])

_rag_chain = _chat_prompt | llm | StrOutputParser()


# ─────────────────────────────────────────────────────────────
#  Chatbot
# ─────────────────────────────────────────────────────────────

class LegalChatbot:

    def __init__(self, role: str = DEFAULT_ROLE):
        self.memory = ConversationMemory()
        self.role   = role.lower() if role.lower() in VALID_ROLES else DEFAULT_ROLE
        print(f"Role set to: {self.role.upper()}\n")

    def set_role(self, role: str):
        if role.lower() in VALID_ROLES:
            self.role = role.lower()
            print(f"✓ Role changed to: {self.role.upper()}\n")
        else:
            print(f"✗ Unknown role '{role}'. "
                  f"Valid roles: {', '.join(sorted(VALID_ROLES))}\n")

    def chat(self, user_message: str) -> str:
        query   = self.memory.enriched_query(user_message)
        context = retrieve_all(query)

        answer = _rag_chain.invoke({
            "system":   get_system_prompt(self.role),
            "memory":   self.memory.build_context_string(),
            "laws":     context["laws_text"],
            "cases":    context["cases_text"],
            "question": user_message,
        })

        # Append the reference legend
        if context["legend"]:
            legend_lines = "\n".join(
                f"  [{n}] {label}" for n, label in context["legend"]
            )
            full_response = (
                f"{answer}\n\n"
                f"─── References ───────────────────────────────\n"
                f"{legend_lines}\n"
                f"──────────────────────────────────────────────"
            )
        else:
            full_response = answer

        # Store only the answer text in memory (not the legend)
        self.memory.add("user",      user_message)
        self.memory.add("assistant", answer)

        return full_response

    def reset(self):
        self.memory.reset()
        print("✓ Conversation cleared.\n")

    def show_memory(self):
        print("\n── Memory ─────────────────────────────────────")
        print(self.memory.stats())
        print()
        print(self.memory.build_context_string())
        print("───────────────────────────────────────────────\n")


# ─────────────────────────────────────────────────────────────
#  REPL
# ─────────────────────────────────────────────────────────────

HELP_TEXT = textwrap.dedent("""\
    Commands:
      role <name>  — set your role: citizen | lawyer | judge
      reset        — clear conversation history & memory
      memory       — show the living record of this session
      help         — show this message
      exit         — quit
""")

if __name__ == "__main__":
    print("⚖️  Legal RAG Chatbot")
    print("   Ask anything about Indian law. Type 'help' for commands.")
    print()
    print("Roles available: citizen | lawyer | judge")
    print("Type 'help' for commands.\n")

    raw_role = input("Enter your role — citizen / lawyer / judge (default: citizen): ").strip().lower()
    role     = raw_role if raw_role in VALID_ROLES else DEFAULT_ROLE

    bot = LegalChatbot(role=role)

    while True:
        try:
            user_input = input("You: ").strip()
        except (KeyboardInterrupt, EOFError):
            print("\nGoodbye.")
            break

        if not user_input:
            continue

        if user_input.lower() == "exit":
            print("Goodbye.")
            break
        elif user_input.lower() == "reset":
            bot.reset()
        elif user_input.lower() == "memory":
            bot.show_memory()
        elif user_input.lower() == "help":
            print(HELP_TEXT)
        elif user_input.lower().startswith("role "):
            bot.set_role(user_input[5:].strip())
        else:
            answer = bot.chat(user_input)
            print(f"\nAssistant: {answer}\n")