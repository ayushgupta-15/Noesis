#!/bin/bash

echo "🚀 Setting up Noēsis - AI Research Agent"
echo "========================================"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check prerequisites
echo "📋 Checking prerequisites..."

if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Node.js found${NC}"

if ! command -v python3 &> /dev/null; then
    echo -e "${RED}❌ Python 3 is not installed${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Python 3 found${NC}"

if ! command -v docker &> /dev/null; then
    echo -e "${YELLOW}⚠ Docker is not installed (optional but recommended)${NC}"
else
    echo -e "${GREEN}✓ Docker found${NC}"
fi

echo ""
echo "📦 Installing Frontend Dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Frontend installation failed${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Frontend dependencies installed${NC}"

echo ""
echo "🐍 Setting up Backend..."
cd backend

# Create virtual environment
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
source venv/bin/activate

# Install dependencies
echo "Installing Python dependencies..."
pip install --upgrade pip
pip install -r requirements.txt

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Backend installation failed${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Backend dependencies installed${NC}"

cd ..

# Setup environment files
echo ""
echo "⚙️ Setting up environment files..."

if [ ! -f ".env.local" ]; then
    cp .env.local.example .env.local
    echo -e "${YELLOW}⚠ Created .env.local - Please add your API keys${NC}"
fi

if [ ! -f "backend/.env" ]; then
    cp backend/.env.example backend/.env
    echo -e "${YELLOW}⚠ Created backend/.env - Please add your API keys and database URLs${NC}"
fi

echo ""
echo -e "${GREEN}✅ Setup complete!${NC}"
echo ""
echo "📝 Next steps:"
echo "1. Edit backend/.env with your API keys (OPENAI_API_KEY, EXA_API_KEY, etc.)"
echo "2. Edit .env.local with frontend configuration"
echo "3. Start databases: cd backend && docker-compose up -d"
echo "4. Start backend: cd backend && source venv/bin/activate && uvicorn main:app --reload"
echo "5. Start frontend: npm run dev"
echo ""
echo "📚 For detailed instructions, see README.md"
