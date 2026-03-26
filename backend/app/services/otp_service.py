"""WellKOC — OTP Service"""
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.redis_client import get_redis
import pyotp, secrets
class OTPService:
    def __init__(self, db: AsyncSession): self.db = db
    async def send(self, target: str, purpose: str):
        code = str(secrets.randbelow(900000) + 100000)
        r = await get_redis()
        await r.set(f"otp:{purpose}:{target}", code, ex=300)
        # TODO: send via Twilio or email
        return True
    async def verify(self, target: str, code: str, purpose: str):
        r = await get_redis()
        stored = await r.get(f"otp:{purpose}:{target}")
        if stored != code: return None
        await r.delete(f"otp:{purpose}:{target}")
        from sqlalchemy import select, or_
        from app.models.user import User
        result = await self.db.execute(select(User).where(or_(User.email==target,User.phone==target)))
        return result.scalar_one_or_none()
