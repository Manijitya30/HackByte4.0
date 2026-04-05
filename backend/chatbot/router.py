from fastapi import APIRouter
from pydantic import BaseModel
from chatbot.chatbot_engine import LegalChatbot

router = APIRouter(prefix="/chatbot")

# ───────── GLOBAL BOT INSTANCE ─────────
bot = LegalChatbot(role="citizen")


# ───────── REQUEST MODEL ─────────
class ChatRequest(BaseModel):
    message: str
    role: str = "citizen"


# ───────── RESPONSE MODEL ─────────
class ChatResponse(BaseModel):
    response: str


# ───────── CHAT ENDPOINT ─────────
@router.post("/", response_model=ChatResponse)
def chat_api(req: ChatRequest):

    # Change role if needed
    bot.set_role(req.role)

    # Get response
    answer = bot.chat(req.message)

    return {"response": answer}


# ───────── RESET MEMORY ─────────
@router.post("/reset")
def reset_chat():
    bot.reset()
    return {"message": "Chat reset successful"}