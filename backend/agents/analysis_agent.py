"""
Analysis Agent
Analyzes research findings for coverage and identifies gaps
"""
from typing import Dict, Any, List
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import JsonOutputParser
import logging

from config import settings

logger = logging.getLogger(__name__)


class AnalysisAgent:
    """Agent specialized in analyzing research coverage and gaps"""

    def __init__(self):
        self.llm = ChatOpenAI(
            model=settings.DEFAULT_MODEL,
            temperature=0.3,
            api_key=settings.OPENAI_API_KEY
        )

        self.parser = JsonOutputParser()

    async def analyze_findings(
        self,
        topic: str,
        clarifications: str,
        findings: List[Dict[str, Any]],
        queries: List[str],
        iteration: int
    ) -> Dict[str, Any]:
        """Analyze research findings for completeness"""

        findings_text = self._format_findings(findings)

        prompt = ChatPromptTemplate.from_messages([
            ("system", """You are an expert research analyst. Evaluate the research findings
            for comprehensiveness, coverage, and quality.

            Assess:
            1. Coverage of key aspects of the topic
            2. Quality and credibility of sources
            3. Gaps in information
            4. Need for additional research

            Output JSON with:
            - sufficient: boolean, true if research is comprehensive enough
            - coverage_score: float 0-1 indicating completeness
            - gaps: list of specific information gaps
            - next_queries: list of queries to fill gaps (if not sufficient)
            - reasoning: detailed explanation of your assessment"""),

            ("user", """Topic: {topic}

            Clarifications: {clarifications}

            Iteration: {iteration}

            Queries used: {queries}

            Findings ({count} total):
            {findings_text}

            Analyze the research coverage and determine if we have sufficient information.""")
        ])

        chain = prompt | self.llm | self.parser

        try:
            result = await chain.ainvoke({
                "topic": topic,
                "clarifications": clarifications,
                "iteration": iteration,
                "queries": ", ".join(queries),
                "findings_text": findings_text,
                "count": len(findings)
            })

            logger.info(f"Analysis: Coverage {result['coverage_score']:.2%}, Sufficient: {result['sufficient']}")

            return result

        except Exception as e:
            logger.error(f"Error analyzing findings: {str(e)}")
            # Conservative fallback
            return {
                "sufficient": len(findings) > 20,
                "coverage_score": min(len(findings) / 30, 1.0),
                "gaps": ["Unable to analyze due to error"],
                "next_queries": [],
                "reasoning": f"Analysis error: {str(e)}"
            }

    def _format_findings(self, findings: List[Dict[str, Any]]) -> str:
        """Format findings for analysis"""

        if not findings:
            return "No findings yet."

        # Sample findings to stay within token limits
        sample_size = min(30, len(findings))
        sampled = findings[-sample_size:]

        formatted = []
        for i, finding in enumerate(sampled, 1):
            content = finding.get("content", "")[:300]
            source = finding.get("source_url", "Unknown")
            formatted.append(f"{i}. {content}... [Source: {source}]")

        return "\n\n".join(formatted)
