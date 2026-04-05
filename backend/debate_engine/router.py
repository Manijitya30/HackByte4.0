from fastapi import APIRouter
from pydantic import BaseModel
from typing import List
from debate_engine.debate_engine import run_debate_lcel

router = APIRouter(prefix="/debate")


# ───────── REQUEST SCHEMA ─────────
class Evidence(BaseModel):
    prosecution: List[str]
    defense: List[str]


class DebateRequest(BaseModel):
    case: str
    evidence: Evidence
    rounds: int = 3


# ───────── RESPONSE FORMATTER ─────────
def format_script(history):
    role_map = {
        "Prosecutor": "prosecution",
        "Defense": "defense",
        "Judge": "judge"
    }

    return [
        {
            "role": role_map.get(h["role"], h["role"].lower()),
            "text": h["short"]
        }
        for h in history
    ]


def format_long(history):
    role_map = {
        "Prosecutor": "prosecution",
        "Defense": "defense",
        "Judge": "judge"
    }

    return [
        {
            "role": role_map.get(h["role"], h["role"].lower()),
            "text": h["long"]
        }
        for h in history
    ]


# ───────── API ENDPOINT ─────────
@router.post("/")
def debate_api(req: DebateRequest):
    print(req)
    result = run_debate_lcel(
        case_text=req.case,
        evidence=req.evidence.dict(),
        rounds=req.rounds
    )

    history = result["history"]

    return {
        "script": format_script(history),        # 👈 SHORT
        "long_arguments": format_long(history),  # 👈 LONG
        "final_judgment": result["final_judgment"]
    }