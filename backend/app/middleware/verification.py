"""
WellKOC — Verification Middleware
Dependency that enforces minimum verification level on endpoints.

Verification levels:
    0 — Chưa xác minh: Chỉ duyệt sản phẩm
    1 — Email verified: Duyệt + danh sách yêu thích
    2 — Phone verified: Có thể mua hàng
    3 — Identity verified: Có thể trở thành KOC
    4 — Bank verified: Có thể rút tiền
    5 — Fully verified: Toàn quyền truy cập

Usage:
    @router.post("/withdraw", dependencies=[Depends(require_verification(4))])
    async def withdraw(...):
        ...
"""
from typing import Annotated

from fastapi import Depends, HTTPException, status
from app.api.v1.deps import get_current_user
from app.models.user import User, UserRole

LEVEL_LABELS = {
    0: "Chưa xác minh",
    1: "Email đã xác minh",
    2: "Điện thoại đã xác minh",
    3: "Danh tính đã xác minh (CCCD/CMND)",
    4: "Tài khoản ngân hàng đã xác minh",
    5: "Xác minh đầy đủ",
}

LEVEL_NEXT_STEP = {
    0: "Vui lòng xác minh email để tiếp tục",
    1: "Vui lòng xác minh số điện thoại để tiếp tục",
    2: "Vui lòng xác minh CCCD/CMND để tiếp tục",
    3: "Vui lòng xác minh tài khoản ngân hàng để tiếp tục",
    4: "Vui lòng hoàn tất tất cả bước xác minh để tiếp tục",
}


def require_verification(min_level: int):
    """
    FastAPI dependency factory that checks the user's verification_level.

    Args:
        min_level: Minimum verification level required (0-5).

    Returns:
        Dependency function that returns the current User if verified,
        otherwise raises HTTP 403.
    """

    async def _check_verification(
        current_user: Annotated[User, Depends(get_current_user)],
    ) -> User:
        # Super admin bypasses all verification checks
        if current_user.role == UserRole.SUPER_ADMIN:
            return current_user

        # Check if account is suspended
        if current_user.is_suspended:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Tài khoản đã bị tạm ngưng. Lý do: {current_user.suspended_reason or 'Không xác định'}",
            )

        user_level = current_user.verification_level or 0

        if user_level < min_level:
            next_step = LEVEL_NEXT_STEP.get(user_level, "Vui lòng hoàn tất xác minh")
            required_label = LEVEL_LABELS.get(min_level, f"Cấp {min_level}")

            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail={
                    "message": f"Yêu cầu xác minh cấp {min_level}: {required_label}",
                    "current_level": user_level,
                    "required_level": min_level,
                    "next_step": next_step,
                },
            )

        return current_user

    return _check_verification
