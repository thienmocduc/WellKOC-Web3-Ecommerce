"""
WellKOC — Auth Endpoints
POST /auth/register
POST /auth/login
POST /auth/otp/send
POST /auth/otp/verify
POST /auth/wallet/connect
POST /auth/refresh
POST /auth/logout
GET  /auth/me
"""
from datetime import datetime, timedelta, timezone
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.config import settings
from app.schemas.auth import (
    RegisterRequest, LoginRequest, TokenResponse,
    OTPSendRequest, OTPVerifyRequest,
    WalletConnectRequest, UserMeResponse,
)
from app.services.auth_service import AuthService
from app.services.otp_service import OTPService
from app.api.v1.deps import get_current_user
from app.models.user import User


router = APIRouter(prefix="/auth", tags=["Auth"])


@router.post("/register", response_model=TokenResponse, status_code=201)
async def register(
    body: RegisterRequest,
    request: Request,
    db: AsyncSession = Depends(get_db),
):
    """
    Register new user (Buyer/KOC/Vendor).
    Sends OTP for verification.
    """
    svc = AuthService(db)
    tokens, user = await svc.register(
        email=body.email,
        phone=body.phone,
        password=body.password,
        role=body.role,
        referral_code=body.referral_code,
        language=body.language or "vi",
        ip=request.client.host if request.client else None,
    )
    return tokens


@router.post("/login", response_model=TokenResponse)
async def login(
    body: LoginRequest,
    request: Request,
    db: AsyncSession = Depends(get_db),
):
    """
    Login with email/phone + password.
    Returns JWT access + refresh tokens.
    """
    svc = AuthService(db)
    tokens = await svc.login(
        identifier=body.identifier,  # email or phone
        password=body.password,
        ip=request.client.host if request.client else None,
    )
    if not tokens:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Thông tin đăng nhập không đúng",  # Wrong credentials
            headers={"WWW-Authenticate": "Bearer"},
        )
    return tokens


@router.post("/otp/send")
async def send_otp(
    body: OTPSendRequest,
    db: AsyncSession = Depends(get_db),
):
    """Send OTP to phone or email (rate limited: 1/min)"""
    svc = OTPService(db)
    await svc.send(target=body.target, purpose=body.purpose)
    return {"message": "OTP đã được gửi", "expires_in": 300}


@router.post("/otp/verify", response_model=TokenResponse)
async def verify_otp(
    body: OTPVerifyRequest,
    request: Request,
    db: AsyncSession = Depends(get_db),
):
    """Verify OTP and return JWT tokens"""
    svc = OTPService(db)
    auth_svc = AuthService(db)
    user = await svc.verify(target=body.target, code=body.code, purpose=body.purpose)
    if not user:
        raise HTTPException(status_code=400, detail="OTP không hợp lệ hoặc đã hết hạn")
    tokens = await auth_svc.create_tokens(user)
    return tokens


@router.post("/wallet/connect", response_model=TokenResponse)
async def wallet_connect(
    body: WalletConnectRequest,
    request: Request,
    db: AsyncSession = Depends(get_db),
):
    """
    Sign-in with MetaMask wallet.
    Verifies EIP-712 signature.
    """
    svc = AuthService(db)
    tokens = await svc.wallet_login(
        wallet_address=body.wallet_address,
        signature=body.signature,
        message=body.message,
        ip=request.client.host if request.client else None,
    )
    if not tokens:
        raise HTTPException(status_code=401, detail="Xác thực ví thất bại")
    return tokens


@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(
    refresh_token: str,
    db: AsyncSession = Depends(get_db),
):
    """Exchange refresh token for new access token"""
    svc = AuthService(db)
    tokens = await svc.refresh(refresh_token=refresh_token)
    if not tokens:
        raise HTTPException(status_code=401, detail="Token không hợp lệ")
    return tokens


@router.post("/logout")
async def logout(
    current_user: Annotated[User, Depends(get_current_user)],
    db: AsyncSession = Depends(get_db),
):
    """Invalidate current session"""
    svc = AuthService(db)
    await svc.logout(user_id=current_user.id)
    return {"message": "Đăng xuất thành công"}


@router.get("/me", response_model=UserMeResponse)
async def get_me(
    current_user: Annotated[User, Depends(get_current_user)],
):
    """Get current authenticated user profile"""
    return current_user
