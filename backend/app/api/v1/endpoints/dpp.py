"""WellKOC — DPP NFT Endpoints"""
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.api.v1.deps import CurrentUser
from app.models.product import Product

router = APIRouter(prefix="/dpp", tags=["DPP"])

@router.get("/verify/{token_id}")
async def verify_dpp(token_id: int, db: AsyncSession = Depends(get_db)):
    r = await db.execute(select(Product).where(Product.dpp_nft_token_id == token_id))
    product = r.scalar_one_or_none()
    if not product: raise HTTPException(404, "DPP Token không tồn tại")
    return {"verified": True, "token_id": token_id, "product": {"id": str(product.id), "name": product.name, "manufacturer": product.manufacturer, "lot_number": product.lot_number, "manufacture_date": product.manufacture_date.isoformat() if product.manufacture_date else None, "expiry_date": product.expiry_date.isoformat() if product.expiry_date else None, "certifications": product.certifications, "origin_country": product.origin_country}, "blockchain": {"network": "Polygon", "contract": "0xDPP...", "tx_hash": product.dpp_tx_hash, "ipfs_uri": product.dpp_ipfs_uri}}

@router.get("/product/{product_id}")
async def get_product_dpp(product_id: UUID, db: AsyncSession = Depends(get_db)):
    r = await db.execute(select(Product).where(Product.id == product_id))
    product = r.scalar_one_or_none()
    if not product: raise HTTPException(404)
    if not product.dpp_verified: return {"dpp_verified": False, "message": "Sản phẩm chưa có DPP NFT"}
    return {"dpp_verified": True, "token_id": product.dpp_nft_token_id, "ipfs_uri": product.dpp_ipfs_uri, "tx_hash": product.dpp_tx_hash}

@router.post("/scan/{token_id}")
async def scan_dpp(token_id: int, current_user: CurrentUser, db: AsyncSession = Depends(get_db)):
    from app.services.gamification_service import GamificationService
    from app.models.gamification import WKEvent
    svc = GamificationService(db)
    await svc.award_wk(current_user.id, WKEvent.DPP_VERIFIED_PURCHASE, reference_id=str(token_id))
    return {"scanned": True, "wk_earned": 15, "message": "Sản phẩm chính hãng đã xác minh"}
