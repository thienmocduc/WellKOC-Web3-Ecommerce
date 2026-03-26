"""WellKOC — Product Service"""
from typing import Optional
from uuid import UUID
from sqlalchemy import select, func, or_
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.product import Product

class ProductService:
    def __init__(self, db: AsyncSession): self.db = db
    async def list_products(self,category=None,brand=None,min_price=None,max_price=None,dpp_only=False,sort="popular",page=1,per_page=20):
        q = select(Product).where(Product.status == "active")
        if category: q = q.where(Product.category == category)
        if brand: q = q.where(Product.brand == brand)
        if min_price: q = q.where(Product.price >= min_price)
        if max_price: q = q.where(Product.price <= max_price)
        if dpp_only: q = q.where(Product.dpp_verified == True)
        sort_map = {"popular":Product.order_count.desc(),"newest":Product.created_at.desc(),"price_asc":Product.price.asc(),"price_desc":Product.price.desc(),"rating":Product.rating_avg.desc()}
        q = q.order_by(sort_map.get(sort, Product.order_count.desc()))
        total_r = await self.db.execute(select(func.count()).select_from(q.subquery()))
        total = total_r.scalar() or 0
        q = q.offset((page-1)*per_page).limit(per_page)
        r = await self.db.execute(q)
        items = r.scalars().all()
        return {"items":[self._serialize(p) for p in items],"total":total,"page":page,"per_page":per_page}
    async def hybrid_search(self,query,category=None,dpp_only=False,page=1,per_page=20,lang="vi"):
        q = select(Product).where(Product.status=="active",Product.name.ilike(f"%{query}%"))
        if category: q = q.where(Product.category==category)
        if dpp_only: q = q.where(Product.dpp_verified==True)
        total_r = await self.db.execute(select(func.count()).select_from(q.subquery()))
        total = total_r.scalar() or 0
        q = q.offset((page-1)*per_page).limit(per_page)
        r = await self.db.execute(q); items = r.scalars().all()
        return {"items":[self._serialize(p) for p in items],"total":total,"page":page,"per_page":per_page}
    async def get_by_id(self, product_id: UUID) -> Optional[Product]:
        r = await self.db.execute(select(Product).where(Product.id==product_id))
        return r.scalar_one_or_none()
    async def increment_view(self, product_id: UUID):
        p = await self.get_by_id(product_id)
        if p: p.view_count += 1; self.db.add(p)
    async def create(self, vendor_id: UUID, data) -> Product:
        p = Product(vendor_id=vendor_id,name=data.name,description=data.description,category=data.category,price=data.price,compare_at_price=data.compare_at_price,stock_quantity=data.stock_quantity,images=data.images,manufacturer=data.manufacturer,certifications=data.certifications,lot_number=data.lot_number,sku=data.sku,status="active")
        self.db.add(p); await self.db.flush(); return p
    async def update(self, product_id: UUID, data) -> Product:
        p = await self.get_by_id(product_id)
        if not p: return None
        for k,v in data.model_dump(exclude_none=True).items():
            if hasattr(p,k): setattr(p,k,v)
        self.db.add(p); await self.db.flush(); return p
    async def archive(self, product_id: UUID):
        p = await self.get_by_id(product_id)
        if p: p.status = "archived"; self.db.add(p)
    def _serialize(self,p): return {"id":str(p.id),"name":p.name,"category":p.category,"price":float(p.price),"compare_at_price":float(p.compare_at_price) if p.compare_at_price else None,"stock_quantity":p.stock_quantity,"dpp_verified":p.dpp_verified,"status":p.status,"thumbnail_url":p.thumbnail_url,"rating_avg":float(p.rating_avg),"order_count":p.order_count,"available_stock":p.available_stock,"discount_pct":p.discount_pct}
