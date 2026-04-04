"""WellKOC — OTP Service"""
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException
from app.core.redis_client import get_redis
import secrets


class OTPService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def send(self, target: str, purpose: str):
        r = await get_redis()

        # Rate limit: max 3 OTPs per 10 minutes per target+purpose
        rate_key = f"otp_rate:{purpose}:{target}"
        count = await r.incr(rate_key)
        if count == 1:
            await r.expire(rate_key, 600)  # 10 min window
        if count > 3:
            raise HTTPException(429, "Quá nhiều yêu cầu OTP. Vui lòng thử lại sau 10 phút")

        code = str(secrets.randbelow(900000) + 100000)
        await r.set(f"otp:{purpose}:{target}", code, ex=300)
        # Reset failed attempts counter on new OTP send
        await r.delete(f"otp_fail:{purpose}:{target}")
        # TODO: send via Twilio or email
        return True

    async def verify(self, target: str, code: str, purpose: str):
        r = await get_redis()

        # Brute-force protection: max 5 failed attempts
        fail_key = f"otp_fail:{purpose}:{target}"
        fails = await r.get(fail_key)
        if fails and int(fails) >= 5:
            raise HTTPException(429, "Quá nhiều lần nhập sai. Vui lòng yêu cầu OTP mới")

        stored = await r.get(f"otp:{purpose}:{target}")
        if stored != code:
            count = await r.incr(fail_key)
            if count == 1:
                await r.expire(fail_key, 600)
            return None

        # Success: clean up both keys
        await r.delete(f"otp:{purpose}:{target}")
        await r.delete(fail_key)

        from sqlalchemy import select, or_
        from app.models.user import User
        result = await self.db.execute(
            select(User).where(or_(User.email == target, User.phone == target))
        )
        return result.scalar_one_or_none()
