"""WellKOC — auth schemas"""
from pydantic import BaseModel, EmailStr, Field
from typing import Optional
class RegisterRequest(BaseModel):
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    password: str = Field(..., min_length=8)
    role: str = "buyer"
    referral_code: Optional[str] = None
    language: str = "vi"
class LoginRequest(BaseModel):
    identifier: str
    password: str
class OTPSendRequest(BaseModel):
    target: str
    purpose: str = "login"
class OTPVerifyRequest(BaseModel):
    target: str
    code: str
    purpose: str = "login"
class WalletConnectRequest(BaseModel):
    wallet_address: str
    signature: str
    message: str
class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int
    user: dict
class UserMeResponse(BaseModel):
    id: str
    email: Optional[str]
    phone: Optional[str]
    role: str
    display_name: Optional[str]
    avatar_url: Optional[str]
    language: str
    kyc_status: str
    membership_tier: str
    referral_code: str
    class Config: from_attributes = True
