import json
from pinecone import Pinecone
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnableLambda
from langchain_core.output_parsers import StrOutputParser
import os
from dotenv import load_dotenv

load_dotenv()

# ───────── CONFIG ─────────
PINECONE_API_KEY = os.getenv("PINECONE_API_KEY")
GOOGLE_API_KEY = os.getenv("GOOGLE_GEMINI_API_KEY6")
INDEX_NAME = "hackbyte-tensor"

# ───────── INIT ─────────
pc = Pinecone(api_key=PINECONE_API_KEY)
index = pc.Index(INDEX_NAME)

llm = ChatGoogleGenerativeAI(
    model="gemini-2.5-flash",
    google_api_key=GOOGLE_API_KEY,
    temperature=0.4
)

# ───────── PARSER ─────────
def parse_output(output):
    try:
        output = output.replace("```json", "").replace("```", "").strip()
        parsed = json.loads(output)
        if isinstance(parsed, dict):
            long_text = parsed.get("long", output)
            short_text = parsed.get("short", output[:200])
            return {"long": long_text, "short": short_text}
        else:
            return {"long": output, "short": output[:200]}
    except:
        return {"long": output, "short": output[:200]}

# ───────── RETRIEVER ─────────
def retrieve_context(role, query, evidence):
    results = index.search(
        namespace="legal",
        query={
            "inputs": {"text": query},
            "top_k": 3
        }
    )

    hits = results["result"]["hits"]
    context_text = "\n\n".join([h["fields"]["text"] for h in hits])

    return {
        "laws": context_text,
        "cases": context_text,
        "evidence_p": "\n".join(evidence.get("prosecution", [])),
        "evidence_d": "\n".join(evidence.get("defense", []))
    }

context_runnable = RunnableLambda(lambda x: {
    **x,
    **retrieve_context(x["role"], x["case"], x["evidence"])
})

# ───────── PROMPTS ─────────

prosecutor_prompt = ChatPromptTemplate.from_template("""
You are a SENIOR PUBLIC PROSECUTOR arguing in court.

Case:
{case}

Debate History:
{history}

Relevant Laws:
{laws}

Similar Cases:
{cases}

Prosecution Evidence:
{evidence_p}

Defense Evidence:
{evidence_d}

Round: {round}

TASK:
Build a STRONG, detailed legal argument proving guilt.

STRICT STRUCTURE for "long":
1. Legal Position (clear claim of guilt)
2. Relevant Law (mention specific sections)
3. Application of Law to Facts
4. Evidence Analysis (use prosecution evidence strongly)
5. Attack Defense Evidence (discredit it logically)
6. Case Law Support (use similar cases)
7. Conclusion (clear assertion of guilt)

IMPORTANT RULES:
- Cite sections explicitly (e.g., "Section 378 IPC")
- Use legal reasoning, not generic text
- Strengthen previous arguments
- Do NOT repeat earlier points

IMPORTANT:
Return ONLY valid JSON. No explanation outside JSON.

Format:
{{
  "long": "Highly detailed courtroom-level argument following the structure above",
  "short": "Sharp 2-3 line argument highlighting strongest legal point + evidence"
}}
""")

defense_prompt = ChatPromptTemplate.from_template("""
You are a SENIOR DEFENSE LAWYER.

Case:
{case}

Debate History:
{history}

Relevant Laws:
{laws}

Similar Cases:
{cases}

Prosecution Evidence:
{evidence_p}

Defense Evidence:
{evidence_d}

Round: {round}

TASK:
Defend the accused by creating strong reasonable doubt.

STRICT STRUCTURE for "long":
1. Defense Position (deny guilt / reduce liability)
2. Legal Interpretation (reinterpret law in favor of accused)
3. Challenge Prosecution Case
4. Evidence Weakness Analysis (attack prosecution evidence)
5. Strengthen Defense Evidence
6. Use Precedents (similar cases)
7. Reasonable Doubt Argument

IMPORTANT RULES:
- Focus on lack of intent, consent, or ambiguity
- Create doubt, not just denial
- Challenge interpretation of sections
- Use legal logic, not emotional arguments

IMPORTANT:
Return ONLY valid JSON. No explanation outside JSON.

Format:
{{
  "long": "Detailed defense argument with strong legal reasoning and doubt creation",
  "short": "2-3 line concise argument highlighting key doubt"
}}
""")

judge_prompt = ChatPromptTemplate.from_template("""
You are a JUDGE actively observing the debate.

Case:
{case}

Debate:
{history}

Relevant Laws:
{laws}

Similar Cases:
{cases}

Prosecution Evidence:
{evidence_p}

Defense Evidence:
{evidence_d}

TASK:
Intervene intelligently to improve legal clarity.

STRICT STRUCTURE for "long":
1. Observation of arguments
2. Identify contradiction or weakness
3. Evaluate evidence conflict
4. Ask a precise legal question OR clarify law

IMPORTANT RULES:
- Be neutral and analytical
- Focus on inconsistencies or unclear reasoning
- Push both sides to improve arguments

IMPORTANT:
Return ONLY valid JSON. No explanation outside JSON.

Format:
{{
  "long": "Detailed judicial observation with reasoning",
  "short": "Short intervention (2-3 lines)",
  "intervention_type": "question / contradiction / clarification"
}}
""")

final_judge_prompt = ChatPromptTemplate.from_template("""
You are the FINAL JUDGE delivering the verdict.

Case:
{case}

Full Debate:
{history}

Relevant Laws:
{laws}

Similar Cases:
{cases}

Prosecution Evidence:
{evidence_p}

Defense Evidence:
{evidence_d}

TASK:
Deliver a legally sound final judgment.

STRICT STRUCTURE for "long":
1. Summary of Case
2. Key Issues
3. Analysis of Prosecution Arguments
4. Analysis of Defense Arguments
5. Evaluation of Evidence (both sides)
6. Legal Reasoning (apply sections clearly)
7. Final Decision

IMPORTANT:
- Clearly mention which sections apply
- Compare both sides before concluding
- Be precise and logical

FINAL OUTPUT MUST INCLUDE:
- Verdict (Guilty / Not Guilty)
- Sections Applied (explicit list like "Section 378 IPC")
- Reasoning
- Evidence Impact
- Confidence Score (0–100%)

IMPORTANT:
Return ONLY valid JSON. No explanation outside JSON.

Format:
{{
  "long": "Full detailed judgment including reasoning, analysis, and conclusion",
  "short": "Verdict + one-line reasoning",
  "verdict": "Guilty / Not Guilty",
  "sections_applied": ["Section 378 IPC", "Section 403 IPC"],
  "confidence": "85%"
}}
""")

# ───────── CHAINS ─────────
prosecutor_chain = context_runnable | prosecutor_prompt | llm | StrOutputParser()
defense_chain = context_runnable | defense_prompt | llm | StrOutputParser()
judge_chain = context_runnable | judge_prompt | llm | StrOutputParser()
final_chain = context_runnable | final_judge_prompt | llm | StrOutputParser()

# ───────── STATE INIT ─────────
def init_state(case_text, evidence):
    return {
        "case": case_text,
        "history": [],
        "round": 1,
        "evidence": evidence
    }

# ───────── MAIN FUNCTION ─────────
def run_debate_lcel(case_text, evidence, rounds=3):
    state = init_state(case_text, evidence)

    for i in range(rounds):
        state["round"] = i + 1

        history_text = "\n".join([h["long"] for h in state["history"]])

        # Prosecutor
        p_out = prosecutor_chain.invoke({
            "case": state["case"],
            "history": history_text,
            "round": state["round"],
            "role": "prosecutor",
            "evidence": state["evidence"]
        })
        p = parse_output(p_out)

        state["history"].append({
            "role": "Prosecutor",
            "long": p["long"],
            "short": p["short"]
        })

        # Defense
        d_out = defense_chain.invoke({
            "case": state["case"],
            "history": "\n".join([h["long"] for h in state["history"]]),
            "round": state["round"],
            "role": "defense",
            "evidence": state["evidence"]
        })
        d = parse_output(d_out)

        state["history"].append({
            "role": "Defense",
            "long": d["long"],
            "short": d["short"]
        })

        # Judge every 3 rounds
        if state["round"] % 3 == 0:
            j_out = judge_chain.invoke({
                "case": state["case"],
                "history": "\n".join([h["long"] for h in state["history"]]),
                "round": state["round"],
                "role": "judge",
                "evidence": state["evidence"]
            })
            j = parse_output(j_out)

            state["history"].append({
                "role": "Judge",
                "long": j["long"],
                "short": j["short"]
            })

    # ───────── FINAL JUDGMENT ─────────
    final_output = final_chain.invoke({
        "case": state["case"],
        "history": "\n".join([h["long"] for h in state["history"]]),
        "role": "judge",
        "evidence": state["evidence"]
    })

    final_parsed = parse_output(final_output)

    # ───────── FORMAT FOR FRONTEND ─────────

    role_map = {
        "Prosecutor": "prosecution",
        "Defense": "defense",
        "Judge": "judge"
    }

    script = [
        {
            "role": role_map.get(h["role"], h["role"].lower()),
            "text": h["short"]
        }
        for h in state["history"]
    ]

    long_arguments = [
        {
            "role": role_map.get(h["role"], h["role"].lower()),
            "text": h["long"]
        }
        for h in state["history"]
    ]
    
    print("Final Judgment:", {
        "script": script,
        "long_arguments": long_arguments,
        "history": state["history"],
        "final_judgment": final_parsed
    })

    return {
        "script": script,
        "long_arguments": long_arguments,
        "history": state["history"],
        "final_judgment": final_parsed
    }