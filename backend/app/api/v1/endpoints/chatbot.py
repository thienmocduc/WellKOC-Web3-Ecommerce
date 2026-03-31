"""
WellKOC — Customer Support Chatbot
POST /api/v1/ai/chat   → public (no auth), Gemini 2.5 Flash
Token budget: system ≤ 80 tokens, history ≤ 4 turns, reply ≤ 200 tokens
"""
from __future__ import annotations

import re
from typing import Optional

from fastapi import APIRouter
from pydantic import BaseModel, Field

from app.core.config import settings

router = APIRouter(prefix="/ai", tags=["Chatbot"])

# ── System prompt (≤ 80 tokens, bilingual) ───────────────────────────────────
_SYS = (
    "Bạn là WellKOC AI — trợ lý CSKH thân thiện của WellKOC, nền tảng social-commerce Web3 Việt Nam. "
    "Hoa hồng KOC: T1 40%, T2 13%. DPP NFT trên Polygon. 333 AI agents. "
    "Trả lời tiếng Việt, ngắn gọn (≤ 120 từ), chính xác, thân thiện, dùng emoji hợp lý. "
    "Nếu không biết hãy hướng dẫn liên hệ support@wellkoc.com."
)

# ── Gemini client ─────────────────────────────────────────────────────────────
_model: Optional[object] = None
try:
    if settings.GEMINI_API_KEY:
        import google.generativeai as genai
        genai.configure(api_key=settings.GEMINI_API_KEY)
        _model = genai.GenerativeModel(
            model_name=settings.GEMINI_MODEL,
            system_instruction=_SYS,
        )
except Exception:
    _model = None

# ── Anthropic fallback ────────────────────────────────────────────────────────
_ant: Optional[object] = None
try:
    if settings.ANTHROPIC_API_KEY:
        import anthropic as _a
        _ant = _a.AsyncAnthropic(api_key=settings.ANTHROPIC_API_KEY)
except Exception:
    _ant = None


class HistoryItem(BaseModel):
    role: str      # "user" | "assistant"
    content: str


class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=500)
    history: list[HistoryItem] = Field(default_factory=list, max_length=8)


class ChatResponse(BaseModel):
    reply: str


@router.post("/chat", response_model=ChatResponse)
async def chat(body: ChatRequest):
    """Public customer support chat — no auth required."""
    reply = await _generate(body.message, body.history)
    return ChatResponse(reply=reply)


async def _generate(message: str, history: list[HistoryItem]) -> str:
    # Keep last 4 turns to cap input tokens
    hist = history[-4:]

    # ── Gemini ───────────────────────────────────────────────────────────────
    if _model:
        try:
            import google.generativeai as genai

            # Build conversation content list
            contents = []
            for h in hist:
                contents.append({"role": h.role, "parts": [h.content]})
            contents.append({"role": "user", "parts": [message]})

            cfg = genai.GenerationConfig(
                max_output_tokens=220,
                temperature=0.7,
                candidate_count=1,
            )
            resp = await _model.generate_content_async(contents, generation_config=cfg)
            text = resp.text.strip() if resp.text else ""
            if text:
                return _clean(text)
        except Exception:
            pass

    # ── Anthropic fallback ────────────────────────────────────────────────────
    if _ant:
        try:
            messages = [{"role": h.role, "content": h.content} for h in hist]
            messages.append({"role": "user", "content": message})
            resp = await _ant.messages.create(
                model=settings.ANTHROPIC_MODEL,
                max_tokens=220,
                system=_SYS,
                messages=messages,
            )
            return _clean(resp.content[0].text.strip())
        except Exception:
            pass

    return "Xin lỗi, tôi đang bận. Vui lòng liên hệ support@wellkoc.com để được hỗ trợ nhanh nhất! 💚"


def _clean(text: str) -> str:
    """Strip markdown code fences if any."""
    return re.sub(r"```[a-z]*\n?", "", text).strip("`").strip()
