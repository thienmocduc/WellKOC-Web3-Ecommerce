"""WellKOC — Payments Endpoints (VNPay/MoMo/PayOS/USDT)"""
import hashlib, hmac, json, secrets, time
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.config import settings
from app.api.v1.deps import CurrentUser
from app.models.order import Order

router = APIRouter(prefix="/payments", tags=["Payments"])

class InitiateReq(BaseModel):
    order_id: str
    gateway: str  # vnpay|momo|payos|usdt
    return_url: Optional[str] = None

@router.post("/initiate")
async def initiate_payment(body: InitiateReq, current_user: CurrentUser, db: AsyncSession = Depends(get_db)):
    r = await db.execute(select(Order).where(Order.id == body.order_id))
    order = r.scalar_one_or_none()
    if not order: raise HTTPException(404, "Đơn hàng không tồn tại")
    if str(order.buyer_id) != str(current_user.id): raise HTTPException(403)
    amount = int(order.total)
    txn_ref = secrets.token_hex(8).upper()

    if body.gateway == "vnpay":
        params = {"vnp_Version":"2.1.0","vnp_Command":"pay","vnp_TmnCode":settings.VNPAY_TMN_CODE,"vnp_Amount":str(amount*100),"vnp_CurrCode":"VND","vnp_TxnRef":txn_ref,"vnp_OrderInfo":f"Thanh toan don hang {order.order_number}","vnp_OrderType":"other","vnp_Locale":"vn","vnp_ReturnUrl":body.return_url or settings.VNPAY_RETURN_URL,"vnp_IpAddr":"127.0.0.1","vnp_CreateDate":__import__('datetime').datetime.now().strftime('%Y%m%d%H%M%S')}
        sorted_params = "&".join(f"{k}={v}" for k,v in sorted(params.items()))
        sign = hmac.new(settings.VNPAY_HASH_SECRET.encode(), sorted_params.encode(), hashlib.sha512).hexdigest()
        payment_url = f"{settings.VNPAY_URL}?{sorted_params}&vnp_SecureHash={sign}"
        return {"gateway":"vnpay","payment_url":payment_url,"txn_ref":txn_ref}

    elif body.gateway == "momo":
        return {"gateway":"momo","deeplink":f"momo://app?action=payWithAppToken&partnerCode={settings.MOMO_PARTNER_CODE}&amount={amount}&orderId={txn_ref}","txn_ref":txn_ref}

    elif body.gateway == "usdt":
        return {"gateway":"usdt","network":"Polygon","contract":settings.COMMISSION_CONTRACT_ADDRESS,"amount_usdt":round(amount/24500,4),"wallet":settings.WALLET_PRIVATE_KEY[:10]+"...","txn_ref":txn_ref}

    raise HTTPException(400, f"Gateway không hỗ trợ: {body.gateway}")

@router.post("/webhook/{gateway}")
async def payment_webhook(gateway: str, request: Request, db: AsyncSession = Depends(get_db)):
    body = await request.json()
    # Verify signature for each gateway
    if gateway == "vnpay":
        vnp_secure = body.get("vnp_SecureHash","")
        params = {k:v for k,v in body.items() if k != "vnp_SecureHash"}
        sorted_params = "&".join(f"{k}={v}" for k,v in sorted(params.items()))
        expected = hmac.new(settings.VNPAY_HASH_SECRET.encode(), sorted_params.encode(), hashlib.sha512).hexdigest()
        if vnp_secure != expected: raise HTTPException(400, "Invalid signature")
        if body.get("vnp_ResponseCode") == "00":
            txn_ref = body.get("vnp_TxnRef")
            # TODO: match to order and confirm payment
    return {"RspCode":"00","Message":"Confirm Success"}

@router.get("/status/{txn_ref}")
async def payment_status(txn_ref: str, current_user: CurrentUser):
    return {"txn_ref":txn_ref,"status":"pending","message":"Đang chờ xác nhận thanh toán"}
