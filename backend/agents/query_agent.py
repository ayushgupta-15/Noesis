"""
Query Generation Agent
Generates strategic search queries using LLM
"""
from typing import Dict, Any, List
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import JsonOutputParser
import logging

from config import settings
from db.redis_client import cache_get, cache_set, increment_counter

logger = logging.getLogger(__name__)


class QueryGenerationAgent:
    """Agent specialized in generating effective search queries"""

    def __init__(self):
        self.llm = ChatOpenAI(
            model=settings.DEFAULT_MODEL,
            temperature=0.8,
            api_key=settings.OPENAI_API_KEY
        )

        self.parser = JsonOutputParser()

    async def generate_queries(
        self,
        topic: str,
        clarifications: str,
        findings: List[Dict[str, Any]],
        iteration: int
    ) -> Dict[str, Any]:
        """Generate search queries based on topic and existing findings"""

        # Check cache
        cache_key = f"queries:{hash(topic + clarifications + str(iteration))}"
        cached = await cache_get(cache_key)
        if cached:
            logger.info("Using cached queries")
            await increment_counter("cache_hits")
            return cached

        # Prepare context
        findings_summary = self._summarize_findings(findings) if findings else "No findings yet."

        prompt = ChatPromptTemplate.from_messages([
            ("system", """You are an expert research query strategist. Your job is to generate
            effective search queries that will uncover comprehensive information on a topic.

            Consider:
            1. What aspects haven't been covered yet
            2. What questions remain unanswered
            3. What sources would provide authoritative information
            4. How to diversify search angles

            Output JSON with:
            - queries: list of 3-5 strategic search queries
            - reasoning: explanation of why these queries were chosen
            - confidence: float 0-1 indicating confidence in query effectiveness"""),

            ("user", """Topic: {topic}

            Clarifications: {clarifications}

            Iteration: {iteration}

            Previous Findings Summary:
            {findings_summary}

            Generate new search queries that will fill knowledge gaps and provide comprehensive coverage.
            Focus on queries that will return authoritative, diverse sources.""")
        ])

        chain = prompt | self.llm | self.parser

        try:
            result = await chain.ainvoke({
                "topic": topic,
                "clarifications": clarifications,
                "findings_summary": findings_summary,
                "iteration": iteration
            })

            # Cache result
            await cache_set(cache_key, result, ttl=3600)

            logger.info(f"Generated {len(result['queries'])} queries")

            return result

        except Exception as e:
            logger.error(f"Error generating queries: {str(e)}")
            # Fallback queries
            return {
                "queries": [topic, f"{topic} research", f"{topic} analysis"],
                "reasoning": "Fallback queries due to error",
                "confidence": 0.5
            }

    def _summarize_findings(self, findings: List[Dict[str, Any]]) -> str:
        """Summarize existing findings"""
        if not findings:
            return "No findings yet."

        # Take last 10 findings
        recent = findings[-10:]
        summary = "\n".join([
            f"- {f.get('content', '')[:150]}..." for f in recent
        ])

        return f"Recent findings ({len(findings)} total):\n{summary}"
