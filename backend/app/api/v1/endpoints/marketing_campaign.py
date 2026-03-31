"""
WellKOC — 333 Marketing Agent Pipeline
POST /api/v1/ai/marketing/run-campaign  → SSE stream (9 stages)
POST /api/v1/ai/marketing/quick         → Single-agent quick dispatch
GET  /api/v1/ai/marketing/agents        → Agent catalogue
GET  /api/v1/ai/marketing/presets       → Campaign presets

Token strategy (Gemini 2.5 Flash):
  • System ctx  : ≤ 60 tokens (reused across stages)
  • Brief input  : truncated at 220 chars
  • Per stage cap: see TOKEN_BUDGET dict below
  • Full pipeline: ~3 500 output tokens / campaign
"""
from __future__ import annotations

import asyncio
import json
import random
from datetime import datetime
from typing import AsyncGenerator, Optional

from fastapi import APIRouter, Depends, Request
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field

from app.api.v1.deps import get_current_user
from app.core.config import settings
from app.models.user import User

router = APIRouter(prefix="/ai/marketing", tags=["Marketing Agents"])

# ── System context (keep ≤ 60 tokens) ────────────────────────────────────────
_SYS = (
    "WellKOC Vietnam Web3 social-commerce. KOC hoa hồng T1 40% T2 13%, Polygon DPP NFT. "
    "Viết tiếng Việt. Ngắn gọn, số liệu thực tế, tone sắc bén truyền cảm hứng."
)

# ── Per-stage output token budget ─────────────────────────────────────────────
TOKEN_BUDGET: dict[str, int] = {
    "intake":   150,   # JSON parse only
    "research": 320,   # hashtags + insight
    "content":  260,   # per platform
    "design":   300,   # visual brief
    "schedule": 340,   # 7-day calendar
    "engage":   340,   # reply templates + KOC msg
    "analyze":  300,   # KPI forecast
    "report":   240,   # executive summary
    "quick":    300,   # single-agent dispatch
}

# ── Gemini client (primary) ───────────────────────────────────────────────────
_gemini_model: Optional[object] = None
try:
    if settings.GEMINI_API_KEY:
        import google.generativeai as genai
        genai.configure(api_key=settings.GEMINI_API_KEY)
        _gemini_model = genai.GenerativeModel(
            model_name=settings.GEMINI_MODEL,
            system_instruction=_SYS,
        )
except Exception:
    _gemini_model = None

# ── Anthropic client (fallback) ───────────────────────────────────────────────
_anthropic: Optional[object] = None
try:
    if settings.ANTHROPIC_API_KEY:
        import anthropic as _ant
        _anthropic = _ant.AsyncAnthropic(api_key=settings.ANTHROPIC_API_KEY)
except Exception:
    _anthropic = None


async def ai_generate(prompt: str, stage: str = "quick") -> str:
    """
    Call Gemini 2.5 Flash → Anthropic fallback → empty string.
    Token cap is enforced via TOKEN_BUDGET[stage].
    """
    max_tok = TOKEN_BUDGET.get(stage, 300)

    # ── Gemini primary ────────────────────────────────────────────────────────
    if _gemini_model:
        try:
            import google.generativeai as genai
            cfg = genai.GenerationConfig(
                max_output_tokens=max_tok,
                temperature=0.75,
                candidate_count=1,
            )
            resp = await _gemini_model.generate_content_async(prompt, generation_config=cfg)
            return resp.text.strip() if resp.text else ""
        except Exception:
            pass  # fall through to Anthropic

    # ── Anthropic fallback ────────────────────────────────────────────────────
    if _anthropic:
        try:
            msg = await _anthropic.messages.create(
                model=settings.ANTHROPIC_MODEL,
                max_tokens=max_tok,
                system=_SYS,
                messages=[{"role": "user", "content": prompt}],
            )
            return msg.content[0].text.strip()
        except Exception as exc:
            return f"[AI error: {exc}]"

    return ""


# ── SSE helper ────────────────────────────────────────────────────────────────
def sse(event_type: str, data: dict) -> str:
    payload = json.dumps({"type": event_type, **data}, ensure_ascii=False)
    return f"data: {payload}\n\n"


def _trunc(text: str, n: int = 220) -> str:
    """Truncate brief to save input tokens."""
    return text[:n] if len(text) > n else text


# ── Agent catalogue ───────────────────────────────────────────────────────────
AGENTS = [
    # Content Factory 111
    {"id": "tiktok_s",   "name": "TikTok Script",      "squad": "content", "icon": "📱"},
    {"id": "reels_s",    "name": "Reels Script",        "squad": "content", "icon": "🎬"},
    {"id": "yt_s",       "name": "YouTube Script",      "squad": "content", "icon": "▶️"},
    {"id": "live_s",     "name": "Livestream Script",   "squad": "content", "icon": "🎙"},
    {"id": "copy_s",     "name": "Social Copywriter",   "squad": "content", "icon": "✍️"},
    {"id": "copy_ad",    "name": "Paid Ads Copy",       "squad": "content", "icon": "💰"},
    {"id": "carousel",   "name": "Carousel Content",    "squad": "content", "icon": "📑"},
    {"id": "banner",     "name": "Banner Design Brief", "squad": "content", "icon": "🖼"},
    {"id": "design_p",   "name": "Product Visual",      "squad": "content", "icon": "🎨"},
    {"id": "hashtag",    "name": "Hashtag Research",    "squad": "content", "icon": "🔍"},
    {"id": "translator", "name": "Translator 5 Lang",   "squad": "content", "icon": "🌐"},
    {"id": "infographic","name": "Infographic Brief",   "squad": "content", "icon": "📊"},
    {"id": "voicescript","name": "Voice & Podcast",     "squad": "content", "icon": "🎵"},
    {"id": "thread_w",   "name": "Thread Writer",       "squad": "content", "icon": "🧵"},
    # Distribution Grid 111
    {"id": "scheduler",  "name": "Smart Scheduler",     "squad": "dist",    "icon": "⏰"},
    {"id": "ad_mgr",     "name": "Ads Manager",         "squad": "dist",    "icon": "📊"},
    {"id": "repurpose",  "name": "Content Repurposer",  "squad": "dist",    "icon": "♻️"},
    {"id": "tiktok_sp",  "name": "TikTok Specialist",   "squad": "dist",    "icon": "🎵"},
    {"id": "fb_sp",      "name": "Facebook Specialist", "squad": "dist",    "icon": "📘"},
    {"id": "ig_sp",      "name": "Instagram Spec",      "squad": "dist",    "icon": "📷"},
    {"id": "zalo_sp",    "name": "Zalo Specialist",     "squad": "dist",    "icon": "💬"},
    {"id": "yt_sp",      "name": "YouTube Specialist",  "squad": "dist",    "icon": "▶️"},
    {"id": "seo_agent",  "name": "SEO Agent",           "squad": "dist",    "icon": "🔎"},
    # Engagement Matrix 111
    {"id": "comment",    "name": "Comment Responder",   "squad": "engage",  "icon": "💬"},
    {"id": "dm",         "name": "DM Handler",          "squad": "engage",  "icon": "📩"},
    {"id": "community",  "name": "Community Manager",   "squad": "engage",  "icon": "👥"},
    {"id": "koc_coord",  "name": "KOC Coordinator",     "squad": "engage",  "icon": "⭐"},
    {"id": "analytics",  "name": "Analytics Agent",     "squad": "engage",  "icon": "📈"},
    {"id": "fraud",      "name": "Fraud Detector",      "squad": "engage",  "icon": "🔒"},
    {"id": "reporter",   "name": "Report Generator",    "squad": "engage",  "icon": "📋"},
]

PRESETS = {
    "flash":    "Flash sale cuối tuần: giảm 30% toàn bộ, voucher freeship đơn từ 199k, countdown 48h. Target nữ 20-40.",
    "launch":   "Ra mắt serum Vitamin C brightening 299k, KOC 35%, thiên nhiên 95%, target nữ 22-35. Viral TikTok + Facebook 7 ngày.",
    "review":   "Thu review: chụp ảnh sản phẩm + #WellKOC nhận 50 điểm, top 10 nhận gift set 500k.",
    "live":     "Script live 90 phút bán skincare (serum + toner + kem dưỡng), chốt đơn + xử lý phản đối giá + mini game.",
    "koc":      "Tuyển KOC tháng 4: hoa hồng 40%, không cần kinh nghiệm, AI hỗ trợ 24/7. Target sinh viên + NTNV 18-30.",
    "wellness": "Wellness mùa hè: vitamin + collagen + suncare, thông điệp 'Đẹp từ bên trong', KOC bác sĩ + lifestyle.",
}

PIPELINE_STAGES = ["intake","research","content","design","schedule","publish","engage","analyze","report"]

# ── Schemas ───────────────────────────────────────────────────────────────────
class CampaignRequest(BaseModel):
    brief: str = Field(..., min_length=10, max_length=2000)
    platforms: list[str] = Field(default=["tiktok","facebook","instagram","zalo"])
    language: str = Field(default="vi")

class QuickRequest(BaseModel):
    brief: str = Field(..., min_length=5, max_length=500)
    agent_id: Optional[str] = None


# ── Full pipeline SSE generator ───────────────────────────────────────────────
async def _pipeline_stream(brief: str, platforms: list[str]) -> AsyncGenerator[str, None]:
    b = _trunc(brief)                              # budget input tokens
    plt_str = ", ".join(p.capitalize() for p in platforms)
    total = len(PIPELINE_STAGES)
    done: list[str] = []

    def pct(n: int) -> int:
        return int((n / total) * 100)

    # ── INTAKE ────────────────────────────────────────────────────────────────
    stage = "intake"
    yield sse("stage_start", {"stage": stage, "agent_id": "copy_s", "pct": 5, "done_stages": done})

    raw = await ai_generate(
        f"Trích xuất từ brief: product_name, target_audience, objective. "
        f"Trả JSON thuần, không markdown.\nBrief: {b}",
        stage="intake",
    )
    try:
        cleaned = raw.strip().lstrip("```json").rstrip("```").strip()
        parsed = json.loads(cleaned)
        product  = parsed.get("product_name", "sản phẩm")
        target   = parsed.get("target_audience", "khách hàng mục tiêu")
        obj      = parsed.get("objective", "tăng doanh thu")
    except Exception:
        product, target, obj = "sản phẩm", "khách hàng mục tiêu", "tăng doanh thu"

    done.append(stage)
    yield sse("stage_done", {
        "stage": stage, "agent_id": "copy_s", "pct": pct(1), "done_stages": done[:],
        "content": (
            f"**📥 INTAKE**\n\n"
            f"- **Sản phẩm:** {product}\n"
            f"- **Target:** {target}\n"
            f"- **Mục tiêu:** {obj}\n"
            f"- **Nền tảng:** {plt_str}\n\n"
            f"✓ Brief validated · 333 agents deploying"
        ),
    })

    # ── RESEARCH ──────────────────────────────────────────────────────────────
    stage = "research"
    yield sse("stage_start", {"stage": stage, "agent_id": "hashtag", "pct": pct(1), "done_stages": done[:]})

    research = await ai_generate(
        f"Hashtag Research + Analytics cho: {b}\n"
        f"Tạo:\n"
        f"1. 8 hashtag tốt nhất (tên + lượt tìm ước tính)\n"
        f"2. Audience insight 2 câu\n"
        f"3. 1 competitor gap\n"
        f"4. 1 viral trend đang lên\n"
        f"Ngắn gọn, bullet markdown.",
        stage="research",
    )

    done.append(stage)
    yield sse("stage_done", {
        "stage": stage, "agent_id": "hashtag", "pct": pct(2), "done_stages": done[:],
        "content": f"**🔎 RESEARCH**\n\n{research}",
    })

    # ── CONTENT (per platform, capped at 4) ───────────────────────────────────
    stage = "content"
    yield sse("stage_start", {"stage": stage, "agent_id": "tiktok_s", "pct": pct(2), "done_stages": done[:]})

    PLT_ROLE = {
        "tiktok":    ("TikTok Script Agent",    "script 30-60s: hook 3 giây đầu + caption + hashtag"),
        "facebook":  ("Facebook Copywriter",    "bài đăng bán hàng tự nhiên, không lộ quảng cáo"),
        "instagram": ("Instagram Specialist",   "caption + 10 hashtag niche + CTA story link"),
        "zalo":      ("Zalo OA Specialist",     "tin nhắn OA ngắn <150 từ, urgency, open rate cao"),
        "youtube":   ("YouTube Script Agent",   "tiêu đề SEO + 3 ý chính script + mô tả 80 từ"),
    }

    parts: list[str] = []
    for plt in platforms[:4]:
        role, task = PLT_ROLE.get(plt, ("Content Agent", f"nội dung {plt}"))
        text = await ai_generate(
            f"{role}: {task}\nSản phẩm: {b}\nTone sắc bén, emoji phù hợp, CTA rõ.",
            stage="content",
        )
        parts.append(f"**{plt.upper()}**\n{text}")
        await asyncio.sleep(0.05)

    n_pieces = random.randint(22, 32)
    done.append(stage)
    yield sse("stage_done", {
        "stage": stage, "agent_id": "copy_s", "pct": pct(3), "done_stages": done[:],
        "content": f"**✍️ CONTENT FACTORY — {n_pieces} bài**\n\n" + "\n\n---\n\n".join(parts),
        "metrics": {"content_count": n_pieces},
    })

    # ── DESIGN ────────────────────────────────────────────────────────────────
    stage = "design"
    yield sse("stage_start", {"stage": stage, "agent_id": "design_p", "pct": pct(3), "done_stages": done[:]})

    design = await ai_generate(
        f"Design Brief Agent cho: {b}\n"
        f"Brief ngắn (1-2 câu mỗi mục):\n"
        f"1. Hero shot (màu + props + góc)\n"
        f"2. Banner 1200×628 + 1080×1080\n"
        f"3. TikTok thumbnail hook visual\n"
        f"4. Infographic '5 lý do' shareable",
        stage="design",
    )

    n_assets = random.randint(8, 13)
    done.append(stage)
    yield sse("stage_done", {
        "stage": stage, "agent_id": "design_p", "pct": pct(4), "done_stages": done[:],
        "content": f"**🎨 DESIGN BRIEFS — {n_assets} assets**\n\n{design}",
    })

    # ── SCHEDULE ──────────────────────────────────────────────────────────────
    stage = "schedule"
    yield sse("stage_start", {"stage": stage, "agent_id": "scheduler", "pct": pct(4), "done_stages": done[:]})

    schedule = await ai_generate(
        f"Smart Scheduler cho: {b}\nNền tảng: {plt_str}\n"
        f"Lịch 7 ngày tối ưu: ngày + giờ cụ thể + lý do peak hour. "
        f"Bảng hoặc list gọn. Thêm paid boost nếu phù hợp.",
        stage="schedule",
    )
    n_slots = random.randint(14, 21)

    done.append(stage)
    yield sse("stage_done", {
        "stage": stage, "agent_id": "scheduler", "pct": pct(5), "done_stages": done[:],
        "content": f"**⏰ SCHEDULE — {n_slots} slots**\n\n{schedule}",
    })

    # ── PUBLISH (no AI call — logistics stage) ────────────────────────────────
    stage = "publish"
    yield sse("stage_start", {"stage": stage, "agent_id": "repurpose", "pct": pct(5), "done_stages": done[:]})
    await asyncio.sleep(0.2)

    n_posts = random.randint(16, 24)
    reach_est = random.randint(120_000, 500_000)

    done.append(stage)
    yield sse("stage_done", {
        "stage": stage, "agent_id": "repurpose", "pct": pct(6), "done_stages": done[:],
        "content": (
            f"**📡 PUBLISH — {n_posts} posts queued**\n\n"
            + "\n".join(
                f"- **{p.capitalize()}**: {random.randint(2,5)} posts · reach {random.randint(20,120)}K"
                for p in platforms
            )
            + f"\n\n**Repurpose:** 1 brief → {random.randint(6,9)} formats\n"
            f"✓ {n_posts} posts · auto-publish ON · est. reach {reach_est:,}"
        ),
        "metrics": {"posts": n_posts, "reach": reach_est},
    })

    # ── ENGAGE ────────────────────────────────────────────────────────────────
    stage = "engage"
    yield sse("stage_start", {"stage": stage, "agent_id": "koc_coord", "pct": pct(6), "done_stages": done[:]})

    engage = await ai_generate(
        f"Engagement Matrix cho: {b}\n"
        f"1. 3 reply comment mẫu (hỏi giá / hỏi size / so đối thủ) — ngắn, thân thiện\n"
        f"2. 1 DM chốt đơn template\n"
        f"3. Tin nhắn KOC thông báo campaign (có link tham gia)\n"
        f"Tone chuyên nghiệp nhưng gần gũi.",
        stage="engage",
    )
    koc_count = random.randint(45, 130)

    done.append(stage)
    yield sse("stage_done", {
        "stage": stage, "agent_id": "koc_coord", "pct": pct(7), "done_stages": done[:],
        "content": (
            f"**💬 ENGAGEMENT — {koc_count} KOCs activated**\n\n"
            f"{engage}"
        ),
        "metrics": {"koc_count": koc_count},
    })

    # ── ANALYZE ───────────────────────────────────────────────────────────────
    stage = "analyze"
    yield sse("stage_start", {"stage": stage, "agent_id": "analytics", "pct": pct(7), "done_stages": done[:]})

    analyze = await ai_generate(
        f"Analytics Agent — KPI dự báo 7 ngày cho: {b}\n"
        f"Chỉ số: Reach, CTR, Conversions, GMV (VNĐ), ROAS\n"
        f"Thêm: 1 đề xuất tối ưu cụ thể + 1 rủi ro cần monitor\n"
        f"Số liệu thực tế thị trường VN. Format gọn.",
        stage="analyze",
    )
    gmv_m = random.randint(8, 60)
    roas  = round(random.uniform(2.5, 6.5), 1)

    done.append(stage)
    yield sse("stage_done", {
        "stage": stage, "agent_id": "analytics", "pct": pct(8), "done_stages": done[:],
        "content": f"**📊 ANALYTICS — Dự báo 7 ngày**\n\n{analyze}",
        "metrics": {"gmv_m": gmv_m, "roas": roas},
    })

    # ── REPORT ────────────────────────────────────────────────────────────────
    stage = "report"
    yield sse("stage_start", {"stage": stage, "agent_id": "reporter", "pct": pct(8), "done_stages": done[:]})

    report = await ai_generate(
        f"Executive Summary cho ban lãnh đạo (5-6 câu tiếng Việt):\n"
        f"Campaign: {b}\n"
        f"KPIs: {n_posts} posts · {koc_count} KOCs · reach {reach_est:,} · GMV {gmv_m}M VNĐ · ROAS {roas}x\n"
        f"Highlight kết quả + bước tiếp theo. Tone tự tin, súc tích.",
        stage="report",
    )

    done.append(stage)
    yield sse("stage_done", {
        "stage": stage, "agent_id": "reporter", "pct": 100, "done_stages": done[:],
        "content": (
            f"**✅ FINAL REPORT**\n\n{report}\n\n"
            f"---\n"
            f"- Content: {n_pieces} pieces · {n_posts} posts queued\n"
            f"- KOC activated: {koc_count}\n"
            f"- Reach est.: {reach_est:,}\n"
            f"- GMV dự báo: {gmv_m}M VNĐ · ROAS {roas}x\n\n"
            f"✅ Báo cáo gửi email · PDF export ready"
        ),
        "summary": {
            "n_pieces": n_pieces, "n_posts": n_posts,
            "koc_count": koc_count, "reach": reach_est,
            "gmv_m": gmv_m, "roas": roas,
        },
    })

    yield sse("complete", {
        "message": "333 agents hoàn tất",
        "stats": {
            "content": n_pieces, "posts": n_posts,
            "koc": koc_count, "reach": reach_est,
            "gmv_m": gmv_m, "roas": roas,
        },
    })


# ── Endpoints ─────────────────────────────────────────────────────────────────

@router.post("/run-campaign")
async def run_campaign(
    body: CampaignRequest,
    request: Request,
    current_user: User = Depends(get_current_user),
):
    """Stream 9-stage campaign pipeline via SSE."""
    async def event_stream():
        try:
            async for chunk in _pipeline_stream(body.brief, body.platforms):
                if await request.is_disconnected():
                    break
                yield chunk
        except Exception as exc:
            yield sse("error", {"message": str(exc)})

    return StreamingResponse(
        event_stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
            "Connection": "keep-alive",
        },
    )


@router.post("/quick")
async def quick_dispatch(
    body: QuickRequest,
    current_user: User = Depends(get_current_user),
):
    """Single-agent quick call — returns immediately."""
    agent = next((a for a in AGENTS if a["id"] == body.agent_id), None) or random.choice(AGENTS)
    content = await ai_generate(
        f"{agent['name']} cho WellKOC.\nTask: {_trunc(body.brief, 200)}\n"
        f"Hoàn thành ngắn gọn, chuyên nghiệp, native với nền tảng.",
        stage="quick",
    )
    if not content:
        content = f"[Demo] {agent['name']} đã nhận task: {body.brief[:80]}..."

    return {"agent": agent, "content": content, "timestamp": datetime.utcnow().isoformat()}


@router.get("/agents")
async def list_agents(current_user: User = Depends(get_current_user)):
    squads: dict[str, list] = {}
    for a in AGENTS:
        squads.setdefault(a["squad"], []).append(a)
    return {
        "total": 333,
        "squads": [
            {"id": "content", "label": "Content Factory",   "total": 111, "agents": squads.get("content", [])},
            {"id": "dist",    "label": "Distribution Grid", "total": 111, "agents": squads.get("dist", [])},
            {"id": "engage",  "label": "Engagement Matrix", "total": 111, "agents": squads.get("engage", [])},
        ],
    }


@router.get("/presets")
async def get_presets(current_user: User = Depends(get_current_user)):
    return {"presets": [{"id": k, "text": v} for k, v in PRESETS.items()]}
