"""
PostgreSQL with pgvector for embeddings storage
"""
import asyncpg
from typing import Optional, Dict, Any, List
import json
import logging

from config import settings
from models import ResearchStatus

logger = logging.getLogger(__name__)

# Global connection pool
pool: Optional[asyncpg.Pool] = None


async def init_db():
    """Initialize PostgreSQL connection pool and create tables"""
    global pool

    pool = await asyncpg.create_pool(
        settings.DATABASE_URL,
        min_size=5,
        max_size=20
    )

    logger.info("PostgreSQL connection pool created")

    # Create tables and enable pgvector
    async with pool.acquire() as conn:
        # Enable pgvector extension
        await conn.execute("CREATE EXTENSION IF NOT EXISTS vector;")

        # Research table
        await conn.execute("""
            CREATE TABLE IF NOT EXISTS research (
                id UUID PRIMARY KEY,
                topic TEXT NOT NULL,
                clarifications JSONB,
                user_id TEXT,
                status TEXT NOT NULL,
                report TEXT,
                error TEXT,
                created_at TIMESTAMP DEFAULT NOW(),
                updated_at TIMESTAMP DEFAULT NOW()
            );
        """)

        # Findings table with embeddings
        await conn.execute("""
            CREATE TABLE IF NOT EXISTS findings (
                id UUID PRIMARY KEY,
                research_id UUID REFERENCES research(id) ON DELETE CASCADE,
                content TEXT NOT NULL,
                source_url TEXT,
                relevance_score FLOAT,
                embedding vector(1536),
                metadata JSONB,
                created_at TIMESTAMP DEFAULT NOW()
            );
        """)

        # Create index for vector similarity search
        await conn.execute("""
            CREATE INDEX IF NOT EXISTS findings_embedding_idx
            ON findings USING ivfflat (embedding vector_cosine_ops)
            WITH (lists = 100);
        """)

        # Analytics table
        await conn.execute("""
            CREATE TABLE IF NOT EXISTS research_analytics (
                id SERIAL PRIMARY KEY,
                research_id UUID REFERENCES research(id) ON DELETE CASCADE,
                total_queries INT,
                total_searches INT,
                cache_hits INT,
                total_tokens INT,
                total_findings INT,
                iterations_completed INT,
                duration_seconds FLOAT,
                query_efficiency FLOAT,
                source_diversity FLOAT,
                created_at TIMESTAMP DEFAULT NOW()
            );
        """)

        # Activities table for tracking
        await conn.execute("""
            CREATE TABLE IF NOT EXISTS activities (
                id SERIAL PRIMARY KEY,
                research_id UUID REFERENCES research(id) ON DELETE CASCADE,
                activity_type TEXT NOT NULL,
                details JSONB,
                timestamp TIMESTAMP DEFAULT NOW()
            );
        """)

    logger.info("Database tables initialized")


async def save_research(data: Dict[str, Any]) -> bool:
    """Save new research task"""
    async with pool.acquire() as conn:
        await conn.execute("""
            INSERT INTO research (id, topic, clarifications, user_id, status, created_at)
            VALUES ($1, $2, $3, $4, $5, $6)
        """, data["id"], data["topic"], json.dumps(data.get("clarifications", {})),
            data.get("user_id"), data["status"], data["created_at"])

    logger.info(f"Saved research {data['id']}")
    return True


async def get_research(research_id: str) -> Optional[Dict[str, Any]]:
    """Get research by ID"""
    async with pool.acquire() as conn:
        row = await conn.fetchrow("""
            SELECT * FROM research WHERE id = $1
        """, research_id)

        if not row:
            return None

        return dict(row)


async def update_research_status(
    research_id: str,
    status: ResearchStatus,
    report: Optional[str] = None,
    error: Optional[str] = None
) -> bool:
    """Update research status"""
    async with pool.acquire() as conn:
        await conn.execute("""
            UPDATE research
            SET status = $1, report = $2, error = $3, updated_at = NOW()
            WHERE id = $4
        """, status.value, report, error, research_id)

    logger.info(f"Updated research {research_id} status to {status.value}")
    return True


async def save_finding(
    research_id: str,
    content: str,
    source_url: str,
    relevance_score: float,
    embedding: List[float],
    metadata: Dict[str, Any]
) -> str:
    """Save finding with embedding"""
    import uuid

    finding_id = str(uuid.uuid4())

    async with pool.acquire() as conn:
        await conn.execute("""
            INSERT INTO findings (id, research_id, content, source_url, relevance_score, embedding, metadata)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
        """, finding_id, research_id, content, source_url, relevance_score,
            embedding, json.dumps(metadata))

    return finding_id


async def search_similar_findings(
    research_id: str,
    query_embedding: List[float],
    limit: int = 5,
    threshold: float = 0.75
) -> List[Dict[str, Any]]:
    """Search for similar findings using vector similarity"""

    async with pool.acquire() as conn:
        rows = await conn.fetch("""
            SELECT id, content, source_url, relevance_score, metadata,
                   1 - (embedding <=> $1::vector) AS similarity
            FROM findings
            WHERE research_id = $2
              AND 1 - (embedding <=> $1::vector) >= $3
            ORDER BY embedding <=> $1::vector
            LIMIT $4
        """, query_embedding, research_id, threshold, limit)

        return [dict(row) for row in rows]


async def save_analytics(research_id: str, analytics: Dict[str, Any]) -> bool:
    """Save research analytics"""
    async with pool.acquire() as conn:
        await conn.execute("""
            INSERT INTO research_analytics (
                research_id, total_queries, total_searches, cache_hits,
                total_tokens, total_findings, iterations_completed,
                duration_seconds, query_efficiency, source_diversity
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        """, research_id, analytics["total_queries"], analytics["total_searches"],
            analytics["cache_hits"], analytics["total_tokens"], analytics["total_findings"],
            analytics["iterations_completed"], analytics["duration_seconds"],
            analytics["query_efficiency"], analytics["source_diversity"])

    return True


async def get_research_analytics(research_id: str) -> Optional[Dict[str, Any]]:
    """Get analytics for research"""
    async with pool.acquire() as conn:
        row = await conn.fetchrow("""
            SELECT * FROM research_analytics WHERE research_id = $1
        """, research_id)

        if not row:
            return None

        analytics = dict(row)
        analytics["cache_hit_rate"] = (
            analytics["cache_hits"] / analytics["total_searches"]
            if analytics["total_searches"] > 0 else 0
        )

        return analytics


async def log_activity(research_id: str, activity_type: str, details: Dict[str, Any]) -> bool:
    """Log research activity"""
    async with pool.acquire() as conn:
        await conn.execute("""
            INSERT INTO activities (research_id, activity_type, details)
            VALUES ($1, $2, $3)
        """, research_id, activity_type, json.dumps(details))

    return True
