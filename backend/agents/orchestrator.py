"""
Research Orchestrator - manages research lifecycle
"""
import uuid
from datetime import datetime
from typing import AsyncGenerator, Dict, Any, Optional
import logging

from agents.graph import ResearchGraph, ResearchState
from models import ResearchStatus, ActivityType
from db.postgres import save_research, get_research, update_research_status
from db.redis_client import cache_set, cache_get
from db.neo4j_client import create_research_node
from config import settings

logger = logging.getLogger(__name__)


class ResearchOrchestrator:
    """Orchestrates research tasks using LangGraph pipeline"""

    def __init__(self):
        self.research_graph = ResearchGraph()

    async def initialize_research(
        self,
        topic: str,
        clarifications: Dict[str, str],
        user_id: Optional[str] = None
    ) -> str:
        """Initialize a new research task"""

        research_id = str(uuid.uuid4())

        # Create research record in PostgreSQL
        research_data = {
            "id": research_id,
            "topic": topic,
            "clarifications": clarifications,
            "user_id": user_id or "anonymous",
            "status": ResearchStatus.INITIALIZED.value,
            "created_at": datetime.utcnow()
        }

        await save_research(research_data)

        # Create node in Neo4j knowledge graph
        await create_research_node(research_id, topic, user_id)

        logger.info(f"Initialized research {research_id} for topic: {topic}")

        return research_id

    async def execute_research(self, research_id: str) -> AsyncGenerator[Dict[str, Any], None]:
        """Execute research workflow and stream updates"""

        # Get research data
        research = await get_research(research_id)

        if not research:
            raise ValueError(f"Research {research_id} not found")

        # Initialize state
        initial_state: ResearchState = {
            "research_id": research_id,
            "topic": research["topic"],
            "clarifications": str(research.get("clarifications", {})),
            "user_id": research.get("user_id", "anonymous"),
            "status": ResearchStatus.GENERATING_QUERIES,
            "iteration": 1,
            "max_iterations": settings.MAX_ITERATIONS,
            "queries": [],
            "search_results": [],
            "findings": [],
            "processed_urls": [],
            "analysis": {},
            "validation": {},
            "sufficient": False,
            "report": "",
            "messages": [],
            "metadata": {
                "start_time": datetime.utcnow().isoformat(),
                "query_reasoning": "",
                "analysis_reasoning": ""
            }
        }

        # Execute workflow
        try:
            async for state_update in self.research_graph.execute(initial_state):
                # Extract node name and state
                node_name = list(state_update.keys())[0]
                state = state_update[node_name]

                # Prepare stream update
                update = {
                    "type": "status",
                    "status": state["status"].value,
                    "iteration": state["iteration"],
                    "timestamp": datetime.utcnow().isoformat()
                }

                # Add node-specific data
                if node_name == "generate_queries":
                    update["data"] = {
                        "type": ActivityType.QUERY_GENERATION.value,
                        "queries": state["queries"],
                        "reasoning": state["metadata"].get("query_reasoning", "")
                    }

                elif node_name == "search":
                    update["data"] = {
                        "type": ActivityType.SEARCH.value,
                        "results_count": len(state["search_results"]),
                        "findings_count": len(state["findings"])
                    }

                elif node_name == "analyze":
                    update["data"] = {
                        "type": ActivityType.ANALYSIS.value,
                        "coverage": state["analysis"].get("coverage_score", 0),
                        "gaps": state["analysis"].get("gaps", []),
                        "reasoning": state["metadata"].get("analysis_reasoning", "")
                    }

                elif node_name == "validate":
                    update["data"] = {
                        "type": ActivityType.VALIDATION.value,
                        "is_valid": state["validation"].get("is_valid", False),
                        "confidence": state["validation"].get("confidence", 0)
                    }

                elif node_name == "generate_report":
                    update["data"] = {
                        "type": "report",
                        "content": state["report"]
                    }

                    # Save final report to database
                    await update_research_status(
                        research_id,
                        ResearchStatus.COMPLETED,
                        report=state["report"]
                    )

                # Cache state
                await cache_set(f"research:{research_id}:state", state)

                yield update

        except Exception as e:
            logger.error(f"Error executing research {research_id}: {str(e)}")
            await update_research_status(research_id, ResearchStatus.FAILED, error=str(e))

            yield {
                "type": "error",
                "message": str(e),
                "timestamp": datetime.utcnow().isoformat()
            }

    async def get_research_result(self, research_id: str) -> Optional[Dict[str, Any]]:
        """Get research result"""

        # Try cache first
        cached = await cache_get(f"research:{research_id}:result")
        if cached:
            logger.info(f"Cache hit for research {research_id}")
            return cached

        # Fetch from database
        research = await get_research(research_id)

        if research:
            # Cache result
            await cache_set(
                f"research:{research_id}:result",
                research,
                ttl=settings.CACHE_TTL
            )

        return research

    async def get_analytics(self, research_id: str) -> Optional[Dict[str, Any]]:
        """Get analytics for research task"""

        from db.postgres import get_research_analytics

        analytics = await get_research_analytics(research_id)
        return analytics
