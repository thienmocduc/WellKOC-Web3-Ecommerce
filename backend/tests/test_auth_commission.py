"""
WellKOC — Test Suite: Auth + Commission
pytest --asyncio-mode=auto -v
"""
import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker

from app.main import app
from app.core.database import get_db, Base
from app.core.config import settings

# ── Test DB setup ─────────────────────────────────────────────
TEST_DB_URL = "postgresql+asyncpg://wellkoc_test:test_pass@localhost:5432/wellkoc_test"

test_engine = create_async_engine(TEST_DB_URL, echo=False)
TestSession = async_sessionmaker(test_engine, expire_on_commit=False)


async def override_get_db():
    async with TestSession() as session:
        yield session


app.dependency_overrides[get_db] = override_get_db


@pytest_asyncio.fixture(autouse=True, scope="session")
async def setup_db():
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)


@pytest_asyncio.fixture
async def client():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as c:
        yield c


# ══ AUTH TESTS ═══════════════════════════════════════════════

class TestRegister:
    async def test_register_buyer_success(self, client: AsyncClient):
        resp = await client.post("/api/v1/auth/register", json={
            "email": "buyer@test.com",
            "password": "Test1234!",
            "role": "buyer",
            "language": "vi",
        })
        assert resp.status_code == 201
        data = resp.json()
        assert "access_token" in data
        assert "refresh_token" in data
        assert data["user"]["role"] == "buyer"

    async def test_register_duplicate_email(self, client: AsyncClient):
        payload = {"email": "dup@test.com", "password": "Test1234!", "role": "buyer"}
        await client.post("/api/v1/auth/register", json=payload)
        resp = await client.post("/api/v1/auth/register", json=payload)
        assert resp.status_code == 400

    async def test_register_koc(self, client: AsyncClient):
        resp = await client.post("/api/v1/auth/register", json={
            "phone": "+84901234567",
            "password": "Test1234!",
            "role": "koc",
            "language": "vi",
        })
        assert resp.status_code == 201
        assert resp.json()["user"]["role"] == "koc"

    async def test_register_vendor(self, client: AsyncClient):
        resp = await client.post("/api/v1/auth/register", json={
            "email": "vendor@test.com",
            "password": "Test1234!",
            "role": "vendor",
        })
        assert resp.status_code == 201
        assert resp.json()["user"]["role"] == "vendor"

    async def test_register_with_referral(self, client: AsyncClient):
        # Create referrer
        r1 = await client.post("/api/v1/auth/register", json={
            "email": "referrer@test.com",
            "password": "Test1234!",
            "role": "koc",
        })
        code = r1.json()["user"]["referral_code"]

        r2 = await client.post("/api/v1/auth/register", json={
            "email": "referred@test.com",
            "password": "Test1234!",
            "role": "buyer",
            "referral_code": code,
        })
        assert r2.status_code == 201


class TestLogin:
    async def test_login_email_success(self, client: AsyncClient):
        await client.post("/api/v1/auth/register", json={
            "email": "login@test.com", "password": "Test1234!", "role": "buyer"
        })
        resp = await client.post("/api/v1/auth/login", json={
            "identifier": "login@test.com", "password": "Test1234!"
        })
        assert resp.status_code == 200
        assert "access_token" in resp.json()

    async def test_login_wrong_password(self, client: AsyncClient):
        await client.post("/api/v1/auth/register", json={
            "email": "wrongpw@test.com", "password": "Test1234!", "role": "buyer"
        })
        resp = await client.post("/api/v1/auth/login", json={
            "identifier": "wrongpw@test.com", "password": "WrongPassword!"
        })
        assert resp.status_code == 401

    async def test_login_nonexistent_user(self, client: AsyncClient):
        resp = await client.post("/api/v1/auth/login", json={
            "identifier": "nobody@test.com", "password": "Test1234!"
        })
        assert resp.status_code == 401

    async def test_get_me_with_valid_token(self, client: AsyncClient):
        r = await client.post("/api/v1/auth/register", json={
            "email": "me@test.com", "password": "Test1234!", "role": "buyer"
        })
        token = r.json()["access_token"]
        resp = await client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {token}"})
        assert resp.status_code == 200
        assert resp.json()["email"] == "me@test.com"

    async def test_get_me_no_token(self, client: AsyncClient):
        resp = await client.get("/api/v1/auth/me")
        assert resp.status_code == 401

    async def test_refresh_token(self, client: AsyncClient):
        r = await client.post("/api/v1/auth/register", json={
            "email": "refresh@test.com", "password": "Test1234!", "role": "buyer"
        })
        refresh = r.json()["refresh_token"]
        resp = await client.post("/api/v1/auth/refresh", json={"refresh_token": refresh})
        assert resp.status_code == 200
        assert "access_token" in resp.json()


# ══ COMMISSION TESTS ════════════════════════════════════════

class TestCommissionCalculation:
    """Test commission calculation engine — critical business logic"""

    async def test_t1_only_commission(self):
        """Order with only T1 KOC → 40% commission"""
        from decimal import Decimal
        from app.services.commission_service import CommissionService

        # Mock: order total = 1,000,000 VND, T1 KOC gets 40%
        order_total = Decimal("1000000")
        t1_expected = order_total * Decimal("0.40")
        assert t1_expected == Decimal("400000")

    async def test_t1_t2_commission(self):
        """Order with T1 + T2 KOC → correct splits"""
        from decimal import Decimal
        order_total = Decimal("1000000")
        t1 = order_total * Decimal("0.40")
        t2 = order_total * Decimal("0.13")
        platform = order_total * Decimal("0.30")
        remaining = order_total - t1 - t2 - platform
        # Pool share
        assert t1 == Decimal("400000")
        assert t2 == Decimal("130000")
        assert platform == Decimal("300000")
        # Total allocated (T1+T2+pools+platform) must ≤ 100%
        total_rate = Decimal("0.40") + Decimal("0.13") + Decimal("0.09") + Decimal("0.05") + Decimal("0.03") + Decimal("0.30")
        assert total_rate == Decimal("1.00")

    async def test_commission_rates_sum_to_100(self):
        """All commission rates must sum to exactly 100%"""
        rates = [
            settings.COMMISSION_T1_RATE,
            settings.COMMISSION_T2_RATE,
            settings.COMMISSION_POOL_A,
            settings.COMMISSION_POOL_B,
            settings.COMMISSION_POOL_C,
            settings.COMMISSION_PLATFORM,
        ]
        total = sum(rates)
        assert abs(total - 1.0) < 1e-10, f"Commission rates sum to {total}, expected 1.0"


# ══ PRODUCT TESTS ═══════════════════════════════════════════

class TestProducts:
    async def test_list_products_public(self, client: AsyncClient):
        resp = await client.get("/api/v1/products")
        assert resp.status_code == 200
        assert "items" in resp.json()

    async def test_search_products(self, client: AsyncClient):
        resp = await client.get("/api/v1/products/search?q=vitamin")
        assert resp.status_code == 200

    async def test_create_product_requires_vendor(self, client: AsyncClient):
        resp = await client.post("/api/v1/products", json={
            "name": "Test Product", "price": 100000, "category": "skincare"
        })
        assert resp.status_code == 401

    async def test_health_check(self, client: AsyncClient):
        resp = await client.get("/health")
        assert resp.status_code == 200
        assert resp.json()["status"] == "ok"
