"""WellKOC — order schemas"""
from pydantic import BaseModel
from typing import Optional, List
class OrderResponse(BaseModel):
    id: str; order_number: str; status: str; total: float
    items: list; payment_method: Optional[str]=None
    created_at: Optional[str]=None
    class Config: from_attributes = True
