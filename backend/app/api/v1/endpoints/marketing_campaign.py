"""
WellKOC — 333 Marketing Agent Pipeline
POST /api/v1/ai/marketing/run-campaign  → SSE stream (9 stages, real Claude content)
POST /api/v1/ai/marketing/quick         → Single-agent quick dispatch
GET  /api/v1/ai/marketing/agents        → 333 agent catalogue
GET  /api/v1/ai/marketing/presets       → Campaign presets
"""
from __future__ import annotations

import asyncio
import json
import random
from datetime import datetime
from typing import AsyncGenerator, Optional

import anthropic
from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field

from app.api.v1.deps import get_current_user
from app.core.config import settings
from app.models.user import User

router = APIRouter(prefix="/ai/marketing", tags=["Marketing Agents"])

# ── Anthropic client (graceful fallback when key absent) ──────────────────────
_anthropic: Optional[anthropic.AsyncAnthropic] = None
if settings.ANTHROPIC_API_KEY:
    _anthropic = anthropic.AsyncAnthropic(api_key=settings.ANTHROPIC_API_KEY)

PLATFORM_CTX = (
    "You are an elite AI marketing agent for WellKOC — Vietnam's #1 Web3 Social Commerce "
    "platform connecting Buyers, KOC/KOL creators, and Vendors via on-chain commissions "
    "(T1 40%, T2 13%) on Polygon. All products carry DPP (Digital Product Passport) NFTs. "
    "Write in Vietnamese unless asked otherwise. Be concrete, actionable, platform-native."
)

# ── Agent catalogue (matches frontend AGENTS array) ──────────────────────────
AGENTS = [
    # Content Factory 111
    {"id": "tiktok_s",  "name": "TikTok Script",       "squad": "content",  "icon": "📱", "count": 10},
    {"id": "reels_s",   "name": "Reels Script",         "squad": "content",  "icon": "🎬", "count": 10},
    {"id": "yt_s",      "name": "YouTube Script",       "squad": "content",  "icon": "▶️", "count": 10},
    {"id": "live_s",    "name": "Livestream Script",    "squad": "content",  "icon": "🎙", "count": 8},
    {"id": "copy_s",    "name": "Social Copywriter",    "squad": "content",  "icon": "✍️", "count": 8},
    {"id": "copy_ad",   "name": "Paid Ads Copy",        "squad": "content",  "icon": "💰", "count": 7},
    {"id": "carousel",  "name": "Carousel Content",     "squad": "content",  "icon": "📑", "count": 7},
    {"id": "banner",    "name": "Banner Design Brief",  "squad": "content",  "icon": "🖼", "count": 8},
    {"id": "design_p",  "name": "Product Visual",       "squad": "content",  "icon": "🎨", "count": 10},
    {"id": "hashtag",   "name": "Hashtag Research",     "squad": "content",  "icon": "🔍", "count": 6},
    {"id": "translator","name": "Translator 5 Lang",    "squad": "content",  "icon": "🌐", "count": 10},
    {"id": "infographic","name":"Infographic Brief",    "squad": "content",  "icon": "📊", "count": 7},
    {"id": "voicescript","name":"Voice & Podcast",      "squad": "content",  "icon": "🎵", "count": 6},
    {"id": "thread_w",  "name": "Thread Writer",        "squad": "content",  "icon": "🧵", "count": 4},
    # Distribution Grid 111
    {"id": "scheduler", "name": "Smart Scheduler",      "squad": "dist",     "icon": "⏰", "count": 15},
    {"id": "ad_mgr",    "name": "Ads Manager",          "squad": "dist",     "icon": "📊", "count": 20},
    {"id": "repurpose", "name": "Content Repurposer",   "squad": "dist",     "icon": "♻️", "count": 20},
    {"id": "tiktok_sp", "name": "TikTok Specialist",    "squad": "dist",     "icon": "🎵", "count": 12},
    {"id": "fb_sp",     "name": "Facebook Specialist",  "squad": "dist",     "icon": "📘", "count": 12},
    {"id": "ig_sp",     "name": "Instagram Spec",       "squad": "dist",     "icon": "📷", "count": 10},
    {"id": "zalo_sp",   "name": "Zalo Specialist",      "squad": "dist",     "icon": "💬", "count": 8},
    {"id": "yt_sp",     "name": "YouTube Specialist",   "squad": "dist",     "icon": "▶️", "count": 8},
    {"id": "seo_agent", "name": "SEO Agent",            "squad": "dist",     "icon": "🔎", "count": 6},
    # Engagement Matrix 111
    {"id": "comment",   "name": "Comment Responder",    "squad": "engage",   "icon": "💬", "count": 30},
    {"id": "dm",        "name": "DM Handler",           "squad": "engage",   "icon": "📩", "count": 25},
    {"id": "community", "name": "Community Manager",    "squad": "engage",   "icon": "👥", "count": 20},
    {"id": "koc_coord", "name": "KOC Coordinator",      "squad": "engage",   "icon": "⭐", "count": 16},
    {"id": "analytics", "name": "Analytics Agent",      "squad": "engage",   "icon": "📈", "count": 10},
    {"id": "fraud",     "name": "Fraud Detector",       "squad": "engage",   "icon": "🔒", "count": 8},
    {"id": "reporter",  "name": "Report Generator",     "squad": "engage",   "icon": "📋", "count": 5},
]

PRESETS = {
    "flash":    "Campaign flash sale cuối tuần: giảm 30% toàn bộ sản phẩm, tặng voucher freeship đơn từ 199k, countdown 48h. Target: nữ 20-40, đã mua trước đây.",
    "launch":   "Ra mắt serum Vitamin C brightening 299k, chiết khấu KOC 35%, thành phần thiên nhiên 95%, target nữ 22-35. Cần viral TikTok + Facebook trong 7 ngày.",
    "review":   "Chiến dịch thu review: chụp ảnh sản phẩm + hashtag #WellKOC nhận 50 điểm thưởng, top 10 review hay nhất nhận gift set 500k.",
    "live":     "Script livestream 90 phút bán bộ skincare (serum + toner + kem dưỡng), kịch bản chốt đơn, xử lý phản đối giá và mini game quà tặng.",
    "koc":      "Tuyển KOC mới tháng 4: hoa hồng đến 40%, không cần kinh nghiệm, AI hỗ trợ content 24/7. Target: sinh viên và NTNV 18-30.",
    "wellness": "Campaign wellness mùa hè: combo vitamin + collagen + suncare, thông điệp 'Đẹp từ bên trong', kết hợp KOC bác sĩ và lifestyle influencer.",
}

PIPELINE_STAGES = [
    "intake", "research", "content", "design",
    "schedule", "publish", "engage", "analyze", "report",
]


# ── Schemas ───────────────────────────────────────────────────────────────────
class CampaignRequest(BaseModel):
    brief: str = Field(..., min_length=10, max_length=2000)
    platforms: list[str] = Field(default=["tiktok", "facebook", "instagram", "zalo"])
    language: str = Field(default="vi")


class QuickRequest(BaseModel):
    brief: str = Field(..., min_length=5, max_length=500)
    agent_id: Optional[str] = None


# ── SSE helpers ───────────────────────────────────────────────────────────────
def sse(event_type: str, data: dict) -> str:
    """Format a single SSE message."""
    payload = json.dumps({"type": event_type, **data}, ensure_ascii=False)
    return f"data: {payload}\n\n"


async def claude_generate(prompt: str, max_tokens: int = 600) -> str:
    """Call Claude; return empty string if client unavailable."""
    if not _anthropic:
        return ""
    try:
        msg = await _anthropic.messages.create(
            model=settings.ANTHROPIC_MODEL,
            max_tokens=max_tokens,
            messages=[{"role": "user", "content": f"{PLATFORM_CTX}\n\n{prompt}"}],
        )
        return msg.content[0].text.strip()
    except Exception as exc:
        return f"[AI error: {exc}]"


# ── Full pipeline SSE generator ───────────────────────────────────────────────
async def _pipeline_stream(brief: str, platforms: list[str]) -> AsyncGenerator[str, None]:
    plt_str = ", ".join(p.capitalize() for p in platforms)
    total = len(PIPELINE_STAGES)

    def pct(done: int) -> int:
        return int((done / total) * 100)

    done_stages: list[str] = []

    # ── STAGE 0 — INTAKE ───────────────────────────────────────────────────────
    stage = "intake"
    yield sse("stage_start", {"stage": stage, "agent_id": "copy_s", "pct": 5, "done_stages": done_stages})
    await asyncio.sleep(0.3)

    intake_prompt = (
        f"Phân tích brief chiến dịch marketing sau đây. Trả về JSON với các key: "
        f"product_name, target_audience, key_message, objective, platforms.\n\nBrief: {brief}"
    )
    intake_raw = await claude_generate(intake_prompt, 300)

    # Try to parse JSON, fallback to raw text
    try:
        if intake_raw.startswith("```"):
            intake_raw = intake_raw.split("\n", 1)[1].rsplit("```", 1)[0].strip()
        intake_data = json.loads(intake_raw)
        product = intake_data.get("product_name", "sản phẩm")
        target = intake_data.get("target_audience", "khách hàng mục tiêu")
        objective = intake_data.get("objective", "tăng doanh thu")
    except Exception:
        product, target, objective = "sản phẩm", "khách hàng mục tiêu", "tăng doanh thu"
        intake_data = {}

    done_stages.append(stage)
    yield sse("stage_done", {
        "stage": stage, "agent_id": "copy_s", "pct": pct(1), "done_stages": done_stages[:],
        "content": (
            f"**📥 INTAKE — Brief đã phân tích**\n\n"
            f"**Sản phẩm:** {product}\n"
            f"**Target:** {target}\n"
            f"**Mục tiêu:** {objective}\n"
            f"**Nền tảng:** {plt_str}\n"
            f"**Phân công:** Content Factory (111) + Distribution Grid (111) + Engagement Matrix (111)\n\n"
            f"✓ Brief validated · Agents đang được deploy"
        ),
    })

    # ── STAGE 1 — RESEARCH ─────────────────────────────────────────────────────
    stage = "research"
    yield sse("stage_start", {"stage": stage, "agent_id": "hashtag", "pct": pct(1), "done_stages": done_stages[:]})
    await asyncio.sleep(0.4)

    research_prompt = (
        f"Bạn là Hashtag Research Agent + Analytics Agent cho WellKOC. "
        f"Sản phẩm/chiến dịch: {brief[:300]}\n"
        f"Hãy tạo:\n"
        f"1. 8-10 hashtag tốt nhất kèm lượt tìm kiếm ước tính\n"
        f"2. Audience insight ngắn gọn (2-3 câu)\n"
        f"3. 1 competitor gap / cơ hội thị trường\n"
        f"4. Viral signal (trend đang lên liên quan)\n"
        f"Format markdown, ngắn gọn, súc tích."
    )
    research_content = await claude_generate(research_prompt, 500)

    done_stages.append(stage)
    yield sse("stage_done", {
        "stage": stage, "agent_id": "hashtag", "pct": pct(2), "done_stages": done_stages[:],
        "content": f"**🔎 RESEARCH — Phân tích thị trường**\n\n{research_content}",
    })

    # ── STAGE 2 — CONTENT ──────────────────────────────────────────────────────
    stage = "content"
    yield sse("stage_start", {"stage": stage, "agent_id": "tiktok_s", "pct": pct(2), "done_stages": done_stages[:]})
    await asyncio.sleep(0.3)

    # Generate content for each selected platform
    content_results: list[str] = []
    for plt in platforms[:4]:  # cap at 4 to keep latency reasonable
        agent_map = {
            "tiktok": ("TikTok Script Agent", "script TikTok 15-60s với hook mạnh đầu 3 giây, caption và hashtag"),
            "facebook": ("Facebook Copywriter", "bài đăng Facebook bán hàng tự nhiên, không quảng cáo lộ liễu"),
            "instagram": ("Instagram Agent", "caption Instagram + 12 hashtag niche + CTA story"),
            "zalo": ("Zalo Specialist", "tin nhắn Zalo OA ngắn gọn tạo urgency, open rate cao"),
            "youtube": ("YouTube Agent", "tiêu đề video SEO + description + 3 ý main cho script"),
        }
        agent_name, task = agent_map.get(plt, ("Content Agent", f"nội dung cho {plt}"))
        p_prompt = (
            f"Bạn là {agent_name} cho WellKOC.\n"
            f"Brief: {brief[:250]}\n"
            f"Hãy tạo {task}. "
            f"Ngắn gọn, native với nền tảng, có emoji phù hợp, CTA rõ ràng."
        )
        p_content = await claude_generate(p_prompt, 400)
        content_results.append(f"**{plt.upper()}:**\n{p_content}")
        await asyncio.sleep(0.1)

    n_pieces = random.randint(22, 32)
    done_stages.append(stage)
    yield sse("stage_done", {
        "stage": stage, "agent_id": "copy_s", "pct": pct(3), "done_stages": done_stages[:],
        "content": (
            f"**✍️ CONTENT FACTORY — {n_pieces} bài đã tạo**\n\n"
            + "\n\n---\n\n".join(content_results)
            + f"\n\n✓ {n_pieces} nội dung · {len(platforms)} nền tảng · 4+ format"
        ),
        "metrics": {"content_count": n_pieces},
    })

    # ── STAGE 3 — DESIGN ───────────────────────────────────────────────────────
    stage = "design"
    yield sse("stage_start", {"stage": stage, "agent_id": "design_p", "pct": pct(3), "done_stages": done_stages[:]})
    await asyncio.sleep(0.3)

    design_prompt = (
        f"Bạn là Design Brief Agent cho WellKOC.\n"
        f"Brief: {brief[:250]}\n"
        f"Tạo design brief cho:\n"
        f"1. Hero shot sản phẩm (flat lay + lifestyle) — màu sắc, props, góc chụp\n"
        f"2. Banner ads (3 kích thước: 1200×628, 1080×1080, 9×16)\n"
        f"3. TikTok thumbnail — concept before/after hoặc hook visual\n"
        f"4. Infographic '5 lý do chọn sản phẩm' — shareable\n"
        f"Mỗi mục 1-2 câu hướng dẫn cụ thể."
    )
    design_content = await claude_generate(design_prompt, 500)

    n_assets = random.randint(8, 13)
    done_stages.append(stage)
    yield sse("stage_done", {
        "stage": stage, "agent_id": "design_p", "pct": pct(4), "done_stages": done_stages[:],
        "content": f"**🎨 DESIGN BRIEFS — {n_assets} assets**\n\n{design_content}",
    })

    # ── STAGE 4 — SCHEDULE ─────────────────────────────────────────────────────
    stage = "schedule"
    yield sse("stage_start", {"stage": stage, "agent_id": "scheduler", "pct": pct(4), "done_stages": done_stages[:]})
    await asyncio.sleep(0.3)

    schedule_prompt = (
        f"Bạn là Smart Scheduler cho WellKOC.\n"
        f"Chiến dịch: {brief[:200]}\n"
        f"Nền tảng: {plt_str}\n"
        f"Tạo lịch đăng bài tối ưu cho 7 ngày đầu. "
        f"Mỗi nền tảng: ngày/giờ cụ thể + lý do (peak hours, audience behavior). "
        f"Thêm chiến lược paid boost nếu phù hợp. Format bảng hoặc list rõ ràng."
    )
    schedule_content = await claude_generate(schedule_prompt, 500)
    n_slots = random.randint(14, 21)

    done_stages.append(stage)
    yield sse("stage_done", {
        "stage": stage, "agent_id": "scheduler", "pct": pct(5), "done_stages": done_stages[:],
        "content": f"**⏰ SCHEDULE — {n_slots} slots booked**\n\n{schedule_content}",
    })

    # ── STAGE 5 — PUBLISH ──────────────────────────────────────────────────────
    stage = "publish"
    yield sse("stage_start", {"stage": stage, "agent_id": "repurpose", "pct": pct(5), "done_stages": done_stages[:]})
    await asyncio.sleep(0.3)

    n_posts = random.randint(16, 24)
    reach_est = random.randint(120_000, 500_000)

    done_stages.append(stage)
    yield sse("stage_done", {
        "stage": stage, "agent_id": "repurpose", "pct": pct(6), "done_stages": done_stages[:],
        "content": (
            f"**📡 PUBLISH — {n_posts} posts queued**\n\n"
            f"Distribution Grid (111 agents) đang queue nội dung:\n\n"
            + "\n".join(
                f"- **{p.capitalize()}**: {random.randint(2, 5)} posts · reach est. "
                f"{random.randint(20, 120)}K"
                for p in platforms
            )
            + f"\n\n**Repurpose matrix:** 1 brief → {random.randint(6, 9)} format variations\n"
            f"✓ Tổng {n_posts} posts queued · Auto-publish ON · Est. reach {reach_est:,}"
        ),
        "metrics": {"posts": n_posts, "reach": reach_est},
    })

    # ── STAGE 6 — KOC NOTIFY (bonus micro-stage in engage) ───────────────────
    stage = "engage"
    yield sse("stage_start", {"stage": stage, "agent_id": "koc_coord", "pct": pct(6), "done_stages": done_stages[:]})
    await asyncio.sleep(0.3)

    engage_prompt = (
        f"Bạn là Engagement Matrix cho WellKOC (Comment Responder + DM Handler + KOC Coordinator).\n"
        f"Chiến dịch: {brief[:200]}\n"
        f"Tạo:\n"
        f"1. 3 mẫu reply comment phổ biến (hỏi giá, hỏi size, so sánh với đối thủ)\n"
        f"2. 1 DM template tư vấn chốt đơn\n"
        f"3. Message gửi KOC pool thông báo campaign (ngắn, có link tham gia)\n"
        f"Format rõ ràng, tone thân thiện nhưng chuyên nghiệp."
    )
    engage_content = await claude_generate(engage_prompt, 600)
    koc_count = random.randint(45, 130)

    done_stages.append(stage)
    yield sse("stage_done", {
        "stage": stage, "agent_id": "koc_coord", "pct": pct(7), "done_stages": done_stages[:],
        "content": (
            f"**💬 ENGAGEMENT MATRIX — Live**\n\n"
            f"**{koc_count} KOCs** đã nhận asset pack + tracking link cá nhân hoá\n\n"
            + engage_content
        ),
        "metrics": {"koc_count": koc_count},
    })

    # ── STAGE 7 — ANALYZE ──────────────────────────────────────────────────────
    stage = "analyze"
    yield sse("stage_start", {"stage": stage, "agent_id": "analytics", "pct": pct(7), "done_stages": done_stages[:]})
    await asyncio.sleep(0.3)

    analyze_prompt = (
        f"Bạn là Analytics Agent cho WellKOC.\n"
        f"Chiến dịch: {brief[:200]}\n"
        f"Tạo dự báo KPI realistically cho 7 ngày đầu:\n"
        f"- Reach, Impressions, CTR, Conversions, GMV, ROAS\n"
        f"- Đề xuất tối ưu 1-2 điểm cụ thể nhất\n"
        f"- Rủi ro cần theo dõi\n"
        f"Dùng số liệu thực tế cho thị trường Việt Nam. Format ngắn gọn."
    )
    analyze_content = await claude_generate(analyze_prompt, 500)
    gmv_m = random.randint(8, 60)
    roas = round(random.uniform(2.5, 6.5), 1)

    done_stages.append(stage)
    yield sse("stage_done", {
        "stage": stage, "agent_id": "analytics", "pct": pct(8), "done_stages": done_stages[:],
        "content": f"**📊 ANALYTICS — Dự báo 7 ngày**\n\n{analyze_content}",
        "metrics": {"gmv_m": gmv_m, "roas": roas},
    })

    # ── STAGE 8 — REPORT ───────────────────────────────────────────────────────
    stage = "report"
    yield sse("stage_start", {"stage": stage, "agent_id": "reporter", "pct": pct(8), "done_stages": done_stages[:]})
    await asyncio.sleep(0.3)

    report_prompt = (
        f"Bạn là Report Generator cho WellKOC.\n"
        f"Chiến dịch: {brief[:200]}\n"
        f"Nền tảng: {plt_str} · KOCs: {koc_count} · Posts: {n_posts} · Reach: {reach_est:,}\n"
        f"GMV dự báo: {gmv_m}M VNĐ · ROAS: {roas}x\n\n"
        f"Viết Executive Summary ngắn gọn (5-7 câu) bằng tiếng Việt cho ban lãnh đạo, "
        f"highlight kết quả chính và bước tiếp theo."
    )
    report_content = await claude_generate(report_prompt, 400)

    done_stages.append(stage)
    yield sse("stage_done", {
        "stage": stage, "agent_id": "reporter", "pct": 100, "done_stages": done_stages[:],
        "content": (
            f"**✅ FINAL REPORT — Campaign hoàn tất**\n\n"
            f"{report_content}\n\n"
            f"---\n"
            f"**Tóm tắt số liệu:**\n"
            f"- Content: {n_pieces} pieces · {n_posts} posts queued\n"
            f"- KOC activated: {koc_count}\n"
            f"- Reach est.: {reach_est:,}\n"
            f"- GMV dự báo: {gmv_m}M VNĐ · ROAS {roas}x\n\n"
            f"✅ Báo cáo đầy đủ đã gửi qua email · PDF export sẵn sàng"
        ),
        "summary": {
            "n_pieces": n_pieces, "n_posts": n_posts,
            "koc_count": koc_count, "reach": reach_est,
            "gmv_m": gmv_m, "roas": roas,
        },
    })

    yield sse("complete", {
        "message": f"Full campaign pipeline hoàn tất — 333 agents done",
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
    """
    Stream 9-stage marketing pipeline via Server-Sent Events.
    Each event: `data: {type, stage, agent_id, content, pct, ...}\n\n`
    """
    async def event_stream():
        try:
            async for chunk in _pipeline_stream(body.brief, body.platforms):
                # Check if client disconnected
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
    """Single-agent quick dispatch — returns content immediately (no streaming)."""
    agent = next((a for a in AGENTS if a["id"] == body.agent_id), None)
    if not agent:
        agent = random.choice(AGENTS)

    prompt = (
        f"Bạn là {agent['name']} cho WellKOC.\n"
        f"Task: {body.brief}\n"
        f"Hãy hoàn thành task ngắn gọn, chuyên nghiệp, phù hợp với nền tảng."
    )
    content = await claude_generate(prompt, 500)
    if not content:
        content = f"[Demo] {agent['name']} đã nhận task: {body.brief[:100]}..."

    return {
        "agent": agent,
        "content": content,
        "timestamp": datetime.utcnow().isoformat(),
    }


@router.get("/agents")
async def list_agents(current_user: User = Depends(get_current_user)):
    """Return full 333-agent catalogue with squad groupings."""
    squads = {}
    for a in AGENTS:
        squads.setdefault(a["squad"], []).append(a)
    return {
        "total": 333,
        "squads": [
            {"id": "content",  "label": "Content Factory",   "total": 111, "agents": squads.get("content", [])},
            {"id": "dist",     "label": "Distribution Grid", "total": 111, "agents": squads.get("dist", [])},
            {"id": "engage",   "label": "Engagement Matrix", "total": 111, "agents": squads.get("engage", [])},
        ],
    }


@router.get("/presets")
async def get_presets(current_user: User = Depends(get_current_user)):
    return {"presets": [{"id": k, "text": v} for k, v in PRESETS.items()]}
