"""WellKOC — product schemas"""
from pydantic import BaseModel, Field
from typing import Optional, List
class ProductCreate(BaseModel):
    name: str = Field(..., max_length=500)
    description: Optional[str] = None
    category: str
    price: float = Field(..., gt=0)
    compare_at_price: Optional[float] = None
    stock_quantity: int = Field(0, ge=0)
    images: Optional[List[str]] = None
    manufacturer: Optional[str] = None
    certifications: Optional[List[str]] = None
    lot_number: Optional[str] = None
    sku: Optional[str] = None
class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    stock_quantity: Optional[int] = None
    status: Optional[str] = None
class ProductResponse(BaseModel):
    id: str; name: str; category: str; price: float
    stock_quantity: int; dpp_verified: bool; status: str
    thumbnail_url: Optional[str]=None; rating_avg: float=0; order_count: int=0
    available_stock: int = 0; discount_pct: float = 0
    class Config: from_attributes = True
class ProductListResponse(BaseModel):
    items: list; total: int; page: int; per_page: int
class ProductSearchParams(BaseModel):
    q: str; category: Optional[str]=None; lang: str="vi"
