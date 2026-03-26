"""
WellKOC — 111 AI Agents Endpoint
Agent A01: Caption, A03: Hashtag, A07: Calendar, A09: Publisher
All powered by Claude claude-sonnet-4-6 API
"""
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from typing import Optional
from fastapi.responses import StreamingResponse
import anthropic

from app.core.config import settings
from app.api.v1.deps import get_current_user
from app.models.user import User

router = APIRouter(prefix="/ai", tags=["AI Agents"])

client = anthropic.Anthropic(api_key=settings.ANTHROPIC_API_KEY) if settings.ANTHROPIC_API_KEY else None

PLATFORM_CONTEXT = """
You are an AI agent for WellKOC — Vietnam's first Web3 Social Commerce platform.
WellKOC connects Buyers, KOC/KOL influencers, and Vendors with on-chain commission (T1: 40%, T2: 13%) settled automatically on Polygon blockchain.
All products have DPP (Digital Product Passport) NFTs for authenticity verification.
111 AI Agents power the platform 24/7.
"""


# ── Agent A01: Caption Generator ─────────────────────────────
class CaptionRequest(BaseModel):
    product_name: str = Field(..., max_length=200)
    product_desc: Optional[str] = Field(None, max_length=500)
    platform: str = Field("tiktok", pattern="^(tiktok|instagram|facebook|youtube|telegram)$")
    tone: str = Field("enthusiastic", pattern="^(enthusiastic|professional|casual|educational|urgent)$")
    language: str = Field("vi", pattern="^(vi|en|zh|hi|th)$")
    kpi_goal: Optional[str] = Field(None, pattern="^(awareness|conversion|engagement|traffic)$")
    dpp_verified: bool = False
    affiliate_link: Optional[str] = None


@router.post("/caption")
async def generate_caption(
    body: CaptionRequest,
    current_user: User = Depends(get_current_user),
):
    """Agent A01: Generate platform-optimized KOC caption with DPP context"""
    if not client:
        raise HTTPException(503, "AI service unavailable - missing API key")

    lang_names = {"vi": "Vietnamese", "en": "English", "zh": "Chinese", "hi": "Hindi", "th": "Thai"}
    platform_tips = {
        "tiktok": "Start with a strong hook in first 3 seconds. Use trending sounds context. Max 150 words.",
        "instagram": "Visual-first copy. Use line breaks. Max 200 words.",
        "facebook": "Conversational, longer format OK. Include social proof.",
        "youtube": "SEO-optimized description. Include chapters hint.",
        "telegram": "Direct, markdown-formatted. Include CTA button text.",
    }

    prompt = f"""{PLATFORM_CONTEXT}

You are Agent A01 — KOC Content Specialist.

Generate a {body.platform.upper()} caption for:
- Product: {body.product_name}
- Description: {body.product_desc or 'N/A'}
- Tone: {body.tone}
- Language: {lang_names.get(body.language, 'Vietnamese')}
- KPI Goal: {body.kpi_goal or 'conversion'}
- DPP Verified: {'YES ✓ - emphasize authenticity' if body.dpp_verified else 'No'}

Platform guidelines: {platform_tips.get(body.platform, '')}

Include:
1. Strong opening hook
2. Product benefits (3-5 points)
3. Social proof or DPP verification mention{' - blockchain verified authentic' if body.dpp_verified else ''}
4. Clear CTA
5. Relevant hashtags (10-15)
{f'6. Affiliate link placement: {body.affiliate_link}' if body.affiliate_link else ''}

Write ONLY the caption, no explanation."""

    async def stream_caption():
        with client.messages.stream(
            model=settings.ANTHROPIC_MODEL,
            max_tokens=800,
            messages=[{"role": "user", "content": prompt}],
        ) as stream:
            for text in stream.text_stream:
                yield text

    return StreamingResponse(stream_caption(), media_type="text/plain")


# ── Agent A03: Hashtag Generator ─────────────────────────────
class HashtagRequest(BaseModel):
    topic: str = Field(..., max_length=200)
    platform: str = Field("tiktok")
    niche: Optional[str] = Field(None)
    language: str = Field("vi")
    count: int = Field(20, ge=5, le=50)


@router.post("/hashtags")
async def generate_hashtags(body: HashtagRequest, current_user: User = Depends(get_current_user)):
    """Agent A03: Generate optimized hashtag mix (viral + niche + branded)"""
    if not client:
        raise HTTPException(503, "AI service unavailable")

    prompt = f"""{PLATFORM_CONTEXT}
You are Agent A03 — Hashtag & Trend Specialist.

Generate {body.count} hashtags for:
- Topic: {body.topic}
- Platform: {body.platform}
- Niche: {body.niche or 'general wellness/skincare'}
- Language market: {body.language}

Strategy: 30% viral (1M+ posts) + 50% mid-tier (100K-1M) + 20% niche (<100K)
Mix Vietnamese and English hashtags for VN market.
Include WellKOC branded: #WellKOC #DPPVerified #OnChainCommerce

Return ONLY a space-separated list of hashtags, nothing else."""

    resp = client.messages.create(
        model=settings.ANTHROPIC_MODEL,
        max_tokens=400,
        messages=[{"role": "user", "content": prompt}],
    )
    hashtags = resp.content[0].text.strip()
    tag_list = [t.strip() for t in hashtags.split() if t.startswith('#')]
    return {"hashtags": tag_list[:body.count], "count": len(tag_list)}


# ── Agent A07: Smart Link Generator ──────────────────────────
class LinkRequest(BaseModel):
    product_id: str
    koc_id: str
    platform: str = "tiktok"
    campaign_name: Optional[str] = None


@router.post("/link")
async def generate_affiliate_link(body: LinkRequest, current_user: User = Depends(get_current_user)):
    """Generate smart affiliate link with UTM tracking"""
    import hashlib
    # Short code: first 8 chars of hash
    raw = f"{body.koc_id}-{body.product_id}-{body.platform}"
    short = hashlib.sha256(raw.encode()).hexdigest()[:8].upper()

    utm_params = f"utm_source={body.platform}&utm_medium=koc&utm_campaign={body.campaign_name or 'organic'}&ref={body.koc_id[:8]}"
    short_url = f"https://wkc.io/{short}"
    full_url = f"https://wellkoc.com/products/{body.product_id}?{utm_params}"

    return {
        "short_url": short_url,
        "full_url": full_url,
        "short_code": short,
        "tracking": {
            "platform": body.platform,
            "koc_id": body.koc_id,
            "campaign": body.campaign_name or "organic",
        }
    }


# ── Agent A20: KOC Performance Coach ─────────────────────────
@router.post("/coaching/{koc_id}")
async def koc_coaching_report(koc_id: str, current_user: User = Depends(get_current_user)):
    """Agent A20: Weekly AI-powered performance coaching"""
    if not client:
        raise HTTPException(503, "AI service unavailable")

    # In production: fetch real KOC metrics from DB
    mock_metrics = {
        "total_orders": 284,
        "gmv_vnd": 28400000,
        "cvr": 5.9,
        "top_product": "Serum Vitamin C 20%",
        "posting_frequency": "3x/week",
        "best_day": "Friday 8PM",
    }

    prompt = f"""{PLATFORM_CONTEXT}
You are Agent A20 — KOC Performance Coach.

Weekly report for KOC (metrics this week):
{mock_metrics}

Generate a personalized coaching report in Vietnamese:
1. Performance summary (2-3 sentences)
2. Top 3 actionable recommendations
3. Best product to promote next week (with reasoning)
4. Optimal posting schedule
5. One growth strategy based on their data

Be specific, actionable, and encouraging. Max 300 words."""

    resp = client.messages.create(
        model=settings.ANTHROPIC_MODEL,
        max_tokens=600,
        messages=[{"role": "user", "content": prompt}],
    )
    return {"report": resp.content[0].text, "metrics": mock_metrics}
