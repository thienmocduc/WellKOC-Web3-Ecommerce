"""WellKOC — commission schemas"""
from pydantic import BaseModel
from typing import Optional
class CommissionResponse(BaseModel):
    id: str; commission_type: str; amount: float
    status: str; tx_hash: Optional[str]=None
    created_at: Optional[str]=None
    class Config: from_attributes = True
