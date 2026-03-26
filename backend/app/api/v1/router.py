"""
WellKOC — API v1 Router
Registers all endpoint modules with prefix /api/v1
"""
from fastapi import APIRouter

from app.api.v1.endpoints import (
    gamification,
    auth, products, orders, cart, payments,
    commissions, koc, vendor, admin, ai_agents,
    shipping, reviews, dpp, websocket,
)

api_router = APIRouter()

# ── Auth & Users ─────────────────────────────────────────────
api_router.include_router(auth.router)

# ── Commerce ─────────────────────────────────────────────────
api_router.include_router(products.router)
api_router.include_router(cart.router)
api_router.include_router(orders.router)
api_router.include_router(payments.router)
api_router.include_router(shipping.router)
api_router.include_router(reviews.router)

# ── Blockchain ───────────────────────────────────────────────
api_router.include_router(dpp.router)
api_router.include_router(commissions.router)

# ── Platform roles ───────────────────────────────────────────
api_router.include_router(koc.router)
api_router.include_router(vendor.router)
api_router.include_router(admin.router)

# ── AI & Intelligence ────────────────────────────────────────
api_router.include_router(ai_agents.router)

# ── Real-time (WebSocket) ────────────────────────────────────
api_router.include_router(websocket.router)
