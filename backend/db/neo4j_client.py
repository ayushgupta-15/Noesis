"""
Neo4j client for knowledge graph management
Models relationships between topics, sources, findings, and concepts
"""
from neo4j import AsyncGraphDatabase
from typing import List, Dict, Any, Optional
import logging

from config import settings

logger = logging.getLogger(__name__)

driver = None


async def init_db():
    """Initialize Neo4j connection"""
    global driver

    driver = AsyncGraphDatabase.driver(
        settings.NEO4J_URI,
        auth=(settings.NEO4J_USER, settings.NEO4J_PASSWORD)
    )

    # Verify connection
    await driver.verify_connectivity()

    logger.info("Neo4j connection established")

    # Create constraints and indexes
    async with driver.session() as session:
        # Constraints
        await session.run("""
            CREATE CONSTRAINT research_id IF NOT EXISTS
            FOR (r:Research) REQUIRE r.id IS UNIQUE
        """)

        await session.run("""
            CREATE CONSTRAINT source_url IF NOT EXISTS
            FOR (s:Source) REQUIRE s.url IS UNIQUE
        """)

        await session.run("""
            CREATE CONSTRAINT topic_name IF NOT EXISTS
            FOR (t:Topic) REQUIRE t.name IS UNIQUE
        """)

        # Indexes
        await session.run("""
            CREATE INDEX research_created IF NOT EXISTS
            FOR (r:Research) ON (r.created_at)
        """)

    logger.info("Neo4j schema initialized")


async def create_research_node(research_id: str, topic: str, user_id: Optional[str] = None) -> bool:
    """Create research node in knowledge graph"""
    async with driver.session() as session:
        await session.run("""
            MERGE (r:Research {id: $research_id})
            SET r.topic = $topic,
                r.user_id = $user_id,
                r.created_at = datetime()

            MERGE (t:Topic {name: $topic})
            MERGE (r)-[:INVESTIGATES]->(t)
        """, research_id=research_id, topic=topic, user_id=user_id)

    logger.info(f"Created research node for {research_id}")
    return True


async def add_source_to_research(
    research_id: str,
    url: str,
    title: str,
    relevance_score: float,
    content_snippet: str
) -> bool:
    """Add source node and link to research"""
    async with driver.session() as session:
        await session.run("""
            MATCH (r:Research {id: $research_id})

            MERGE (s:Source {url: $url})
            SET s.title = $title,
                s.content_snippet = $content_snippet,
                s.first_seen = coalesce(s.first_seen, datetime())

            MERGE (r)-[rel:CITES]->(s)
            SET rel.relevance_score = $relevance_score,
                rel.cited_at = datetime()
        """, research_id=research_id, url=url, title=title,
            relevance_score=relevance_score, content_snippet=content_snippet[:500])

    return True


async def extract_and_link_concepts(
    research_id: str,
    concepts: List[str],
    source_url: Optional[str] = None
) -> bool:
    """Extract concepts and create relationships"""
    async with driver.session() as session:
        for concept in concepts:
            await session.run("""
                MATCH (r:Research {id: $research_id})

                MERGE (c:Concept {name: $concept})

                MERGE (r)-[:EXPLORES]->(c)
            """, research_id=research_id, concept=concept.lower())

            # Link concept to source if provided
            if source_url:
                await session.run("""
                    MATCH (s:Source {url: $url})
                    MATCH (c:Concept {name: $concept})
                    MERGE (s)-[:MENTIONS]->(c)
                """, url=source_url, concept=concept.lower())

    return True


async def find_related_research(topic: str, limit: int = 5) -> List[Dict[str, Any]]:
    """Find related past research on similar topics"""
    async with driver.session() as session:
        result = await session.run("""
            MATCH (t:Topic {name: $topic})<-[:INVESTIGATES]-(r:Research)
            WHERE r.created_at < datetime()
            RETURN r.id AS research_id, r.topic AS topic, r.created_at AS created_at
            ORDER BY r.created_at DESC
            LIMIT $limit

            UNION

            MATCH (t:Topic)<-[:INVESTIGATES]-(r1:Research)
            WHERE t.name CONTAINS $topic OR $topic CONTAINS t.name
            AND r1.created_at < datetime()
            RETURN r1.id AS research_id, r1.topic AS topic, r1.created_at AS created_at
            ORDER BY r1.created_at DESC
            LIMIT $limit
        """, topic=topic, limit=limit)

        return [dict(record) async for record in result]


async def get_research_graph(research_id: str) -> Dict[str, Any]:
    """Get complete knowledge graph for research"""
    async with driver.session() as session:
        result = await session.run("""
            MATCH (r:Research {id: $research_id})
            OPTIONAL MATCH (r)-[:INVESTIGATES]->(t:Topic)
            OPTIONAL MATCH (r)-[:CITES]->(s:Source)
            OPTIONAL MATCH (r)-[:EXPLORES]->(c:Concept)

            RETURN r,
                   collect(DISTINCT t) AS topics,
                   collect(DISTINCT s) AS sources,
                   collect(DISTINCT c) AS concepts
        """, research_id=research_id)

        record = await result.single()

        if not record:
            return {}

        return {
            "research": dict(record["r"]),
            "topics": [dict(t) for t in record["topics"] if t],
            "sources": [dict(s) for s in record["sources"] if s],
            "concepts": [dict(c) for c in record["concepts"] if c]
        }


async def analyze_source_diversity(research_id: str) -> float:
    """Calculate source diversity score based on graph structure"""
    async with driver.session() as session:
        result = await session.run("""
            MATCH (r:Research {id: $research_id})-[:CITES]->(s:Source)
            WITH r, count(DISTINCT s) AS unique_sources

            MATCH (r)-[:CITES]->(s:Source)-[:MENTIONS]->(c:Concept)
            WITH r, unique_sources, count(DISTINCT c) AS unique_concepts

            RETURN unique_sources, unique_concepts
        """, research_id=research_id)

        record = await result.single()

        if not record:
            return 0.0

        sources = record["unique_sources"]
        concepts = record["unique_concepts"]

        # Diversity score based on source and concept variety
        diversity = min(1.0, (sources * concepts) / 100)

        return diversity


async def close_db():
    """Close Neo4j connection"""
    if driver:
        await driver.close()
        logger.info("Neo4j connection closed")
