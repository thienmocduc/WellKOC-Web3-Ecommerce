#!/usr/bin/env bash
# ══════════════════════════════════════════════════════════════
# WellKOC Platform — Local Development Setup Script
# Usage: ./setup.sh
# ══════════════════════════════════════════════════════════════
set -e

CYAN='\033[0;36m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo ""
echo -e "${CYAN}╔══════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║     WellKOC Platform Setup v1.0          ║${NC}"
echo -e "${CYAN}║     Web3 Social Commerce · Vietnam        ║${NC}"
echo -e "${CYAN}╚══════════════════════════════════════════╝${NC}"
echo ""

# ── Check prerequisites ───────────────────────────────────────
echo -e "${YELLOW}Checking prerequisites...${NC}"

check_cmd() {
  if ! command -v "$1" &>/dev/null; then
    echo -e "${RED}✗ $1 not found. Please install it first.${NC}"
    exit 1
  fi
  echo -e "${GREEN}✓ $1$(NC)"
}

check_cmd docker
check_cmd python3
check_cmd node
check_cmd npm
check_cmd git

echo ""

# ── Copy .env ────────────────────────────────────────────────
if [ ! -f .env ]; then
  echo -e "${YELLOW}Creating .env from example...${NC}"
  cp .env.example .env
  # Generate a secure secret key
  SECRET=$(python3 -c "import secrets; print(secrets.token_hex(32))")
  sed -i "s/your-super-secret-key-change-in-production/$SECRET/" .env
  echo -e "${GREEN}✓ .env created (please fill in API keys)${NC}"
else
  echo -e "${GREEN}✓ .env already exists${NC}"
fi

# ── Start Docker services ─────────────────────────────────────
echo ""
echo -e "${YELLOW}Starting infrastructure (PostgreSQL, Redis, Elasticsearch)...${NC}"
docker-compose up -d postgres redis elasticsearch

echo -e "${YELLOW}Waiting for PostgreSQL to be ready...${NC}"
sleep 5
until docker-compose exec -T postgres pg_isready -U wellkoc -d wellkoc 2>/dev/null; do
  echo "  Waiting for PostgreSQL..."
  sleep 2
done
echo -e "${GREEN}✓ PostgreSQL ready${NC}"

until docker-compose exec -T redis redis-cli ping 2>/dev/null | grep -q PONG; do
  echo "  Waiting for Redis..."
  sleep 1
done
echo -e "${GREEN}✓ Redis ready${NC}"

# ── Backend setup ─────────────────────────────────────────────
echo ""
echo -e "${YELLOW}Setting up Python backend...${NC}"
cd backend

if [ ! -d "venv" ]; then
  python3 -m venv venv
  echo -e "${GREEN}✓ Virtual environment created${NC}"
fi

source venv/bin/activate
pip install --quiet -r requirements.txt
echo -e "${GREEN}✓ Python dependencies installed${NC}"

# Run Alembic migrations
echo -e "${YELLOW}Running database migrations...${NC}"
alembic upgrade head
echo -e "${GREEN}✓ Migrations complete${NC}"

cd ..

# ── Frontend setup ────────────────────────────────────────────
echo ""
echo -e "${YELLOW}Setting up React frontend...${NC}"
cd frontend

if [ ! -d "node_modules" ]; then
  npm install --silent
  echo -e "${GREEN}✓ Node modules installed${NC}"
else
  echo -e "${GREEN}✓ Node modules already installed${NC}"
fi

cd ..

# ── Git initialization ────────────────────────────────────────
echo ""
if [ ! -d ".git" ]; then
  echo -e "${YELLOW}Initializing Git repository...${NC}"
  git init
  git add .
  git commit -m "feat: Initial WellKOC platform structure

- FastAPI backend with async SQLAlchemy
- React + Vite frontend with TypeScript
- Solidity smart contracts (Polygon)
- Docker Compose for full stack
- GitHub Actions CI/CD pipeline
- i18n: vi/en/zh/hi/th
- Commission engine T1/T2/Pool
- DPP NFT Factory"
  echo -e "${GREEN}✓ Git repository initialized${NC}"
  echo ""
  echo -e "${YELLOW}To push to GitHub:${NC}"
  echo "  git remote add origin https://github.com/YOUR_ORG/wellkoc.git"
  echo "  git push -u origin main"
fi

# ── Summary ───────────────────────────────────────────────────
echo ""
echo -e "${CYAN}╔══════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║           SETUP COMPLETE! 🚀              ║${NC}"
echo -e "${CYAN}╚══════════════════════════════════════════╝${NC}"
echo ""
echo -e "  ${GREEN}▶ Start backend:${NC}  cd backend && source venv/bin/activate && uvicorn app.main:app --reload"
echo -e "  ${GREEN}▶ Start frontend:${NC} cd frontend && npm run dev"
echo -e "  ${GREEN}▶ API docs:${NC}        http://localhost:8000/docs"
echo -e "  ${GREEN}▶ Frontend:${NC}        http://localhost:5173"
echo -e "  ${GREEN}▶ Grafana:${NC}         http://localhost:3000  (admin/wellkoc_grafana)"
echo -e "  ${GREEN}▶ Flower:${NC}          http://localhost:5555  (Celery monitor)"
echo ""
echo -e "  ${YELLOW}⚠  Fill in .env with your API keys:${NC}"
echo "     ANTHROPIC_API_KEY, VNPAY_*, MOMO_*, POLYGON_*, etc."
echo ""
