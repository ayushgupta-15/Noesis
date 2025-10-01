# Noēsis Backend - FastAPI + LangGraph

Enterprise-grade AI research orchestration backend.

## Tech Stack

- **FastAPI** - High-performance async API framework
- **LangGraph** - Multi-agent workflow orchestration
- **PostgreSQL + pgvector** - Vector embeddings storage
- **Neo4j** - Knowledge graph database
- **Redis** - Intelligent caching layer
- **OpenAI/Anthropic** - LLM providers

## Quick Start

### Option 1: Docker (Recommended)

```bash
# Copy environment file
cp .env.example .env
# Edit .env with your API keys

# Start all services
docker-compose up -d

# View logs
docker-compose logs -f backend
```

### Option 2: Local Development

```bash
# Install dependencies
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Setup environment
cp .env.example .env
# Edit .env with your API keys and database URLs

# Ensure databases are running
# PostgreSQL on port 5432
# Neo4j on port 7687
# Redis on port 6379

# Run server
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

## API Documentation

Once running, visit:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## Environment Variables

See `.env.example` for all required variables.

Key variables:
- `OPENAI_API_KEY` - Required for LLM operations
- `EXA_API_KEY` - Required for web search
- `DATABASE_URL` - PostgreSQL connection string
- `NEO4J_URI` - Neo4j bolt connection
- `REDIS_URL` - Redis connection string

## Architecture

```
FastAPI
  ├── agents/          # LangGraph agents
  ├── db/              # Database clients
  ├── utils/           # Utilities (logging, export)
  ├── main.py          # FastAPI app
  ├── config.py        # Configuration
  └── models.py        # Pydantic schemas
```

## Testing

```bash
# Run tests (when implemented)
pytest

# Run with coverage
pytest --cov=.
```
