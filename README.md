# Noēsis - AI Research Agent

> Enterprise-grade AI research platform with multi-agent orchestration, vector search, and knowledge graphs.

## Overview

Noēsis is an AI-powered research agent that conducts comprehensive research on any topic using a multi-agent system with LangGraph orchestration, semantic search, and intelligent caching.

### Key Features

- **Multi-Agent System**: 5 specialized AI agents (Query, Search, Analysis, Validation, Report)
- **Vector Search**: PostgreSQL with pgvector for semantic similarity
- **Knowledge Graph**: Neo4j for relationship modeling
- **Intelligent Caching**: Redis with 40%+ cache hit rate
- **Real-time Updates**: WebSocket streaming
- **AI Transparency**: Copilot panel showing agent reasoning
- **Export**: PDF and CSV report generation

## Tech Stack

**Backend:**
- FastAPI (Python)
- LangGraph & LangChain
- PostgreSQL + pgvector
- Neo4j
- Redis
- OpenAI GPT-4

**Frontend:**
- Next.js 15
- React 19
- TypeScript
- Tailwind CSS
- Radix UI

## Quick Start

### Prerequisites

- Node.js 18+
- Python 3.11+
- Docker & Docker Compose
- OpenAI API key
- Exa API key

### Installation

**Option 1: Automated Setup (Recommended)**

```bash
# Windows
setup.bat

# Linux/Mac
chmod +x setup.sh start-dev.sh
./setup.sh
```

**Option 2: Manual Setup**

```bash
# Install frontend dependencies
npm install

# Setup backend
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cd ..
```

### Configuration

**Backend** (`backend/.env`):
```env
OPENAI_API_KEY=sk-...
EXA_API_KEY=...
DATABASE_URL=postgresql://user:password@localhost:5432/noesis
NEO4J_URI=bolt://localhost:7687
NEO4J_USER=neo4j
NEO4J_PASSWORD=password
REDIS_URL=redis://localhost:6379
```

**Frontend** (`.env.local`):
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_WS_URL=ws://localhost:8000
```

### Running the Application

**Option 1: One Command**

```bash
# Windows
start-dev.bat

# Linux/Mac
./start-dev.sh
```

**Option 2: Manual Start**

```bash
# Start databases
cd backend
docker-compose up -d

# Start backend (new terminal)
cd backend
source venv/bin/activate
uvicorn main:app --reload

# Start frontend (new terminal)
npm run dev
```

**Access:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs
- Neo4j Browser: http://localhost:7474 (user: neo4j, pass: password)

## Architecture

```
Next.js Frontend → FastAPI Backend → LangGraph Agents
                        ↓
            PostgreSQL | Neo4j | Redis
```

### Multi-Agent Workflow

```
1. Query Agent → Generates strategic search queries
2. Search Agent → Executes searches, creates embeddings
3. Analysis Agent → Evaluates coverage, identifies gaps
4. Validation Agent → Validates source quality
5. Report Agent → Synthesizes final report
```

## API Endpoints

```
POST   /api/research              # Create research task
GET    /api/research/{id}         # Get research result
GET    /api/analytics/{id}        # Get analytics
GET    /api/research/{id}/export/pdf
GET    /api/research/{id}/export/csv
WS     /api/research/stream/{id}  # Real-time updates
```

## Database Schemas

### PostgreSQL

```sql
-- Vector similarity search
CREATE TABLE findings (
    id UUID PRIMARY KEY,
    research_id UUID,
    content TEXT,
    embedding vector(1536),
    ...
);
```

### Neo4j

```cypher
(Research)-[:INVESTIGATES]->(Topic)
(Research)-[:CITES]->(Source)
(Research)-[:EXPLORES]->(Concept)
```

## Project Structure

```
noesis/
├── backend/              # FastAPI backend
│   ├── agents/           # LangGraph agents
│   ├── db/               # Database clients
│   ├── utils/            # Utilities
│   └── main.py           # FastAPI app
├── src/                  # Next.js frontend
│   ├── app/              # Pages
│   ├── components/       # UI components
│   ├── hooks/            # Custom hooks
│   └── lib/              # API client
└── public/               # Static assets
```

## Development

```bash
# Run tests (when implemented)
npm test
cd backend && pytest

# Lint
npm run lint

# Build
npm run build
```

## Docker Deployment

```bash
cd backend
docker-compose up -d
```

## Troubleshooting

**Backend won't start:**
```bash
cd backend
docker ps                    # Check databases
pip install -r requirements.txt
```

**Frontend issues:**
```bash
npm install
cat .env.local              # Verify config
```

**Database connection:**
```bash
cd backend
docker-compose restart
docker-compose logs
```

## Contributing

This project demonstrates:
- AI/ML engineering with multi-agent systems
- Modern full-stack development
- Multi-database architecture
- Real-time streaming
- Responsible AI practices

## License

MIT License

---

**Built with ❤️ to showcase modern AI engineering**
