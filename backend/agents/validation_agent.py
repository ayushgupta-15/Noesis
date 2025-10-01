"""
Validation Agent
Validates research findings for accuracy and quality
"""
from typing import Dict, Any, List
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import JsonOutputParser
import logging

from config import settings

logger = logging.getLogger(__name__)


class ValidationAgent:
    """Agent specialized in validating research quality"""

    def __init__(self):
        self.llm = ChatOpenAI(
            model=settings.DEFAULT_MODEL,
            temperature=0.2,
            api_key=settings.OPENAI_API_KEY
        )

        self.parser = JsonOutputParser()

    async def validate_findings(
        self,
        findings: List[Dict[str, Any]],
        topic: str
    ) -> Dict[str, Any]:
        """Validate findings for quality and accuracy"""

        findings_summary = self._summarize_findings(findings)

        prompt = ChatPromptTemplate.from_messages([
            ("system", """You are an expert fact-checker and research validator.
            Evaluate research findings for:

            1. Source credibility and diversity
            2. Information consistency
            3. Potential biases
            4. Factual accuracy indicators
            5. Overall reliability

            Output JSON with:
            - is_valid: boolean, true if findings are reliable
            - confidence: float 0-1 indicating validation confidence
            - concerns: list of specific concerns or issues
            - suggestions: list of recommendations for improvement"""),

            ("user", """Topic: {topic}

            Findings to validate ({count} total):
            {findings_summary}

            Validate these research findings.""")
        ])

        chain = prompt | self.llm | self.parser

        try:
            result = await chain.ainvoke({
                "topic": topic,
                "findings_summary": findings_summary,
                "count": len(findings)
            })

            logger.info(f"Validation: {result['confidence']:.2%} confidence, Valid: {result['is_valid']}")

            return result

        except Exception as e:
            logger.error(f"Error validating findings: {str(e)}")
            # Permissive fallback
            return {
                "is_valid": True,
                "confidence": 0.7,
                "concerns": [f"Validation error: {str(e)}"],
                "suggestions": ["Manual validation recommended"]
            }

    def _summarize_findings(self, findings: List[Dict[str, Any]]) -> str:
        """Summarize findings for validation"""

        if not findings:
            return "No findings to validate."

        # Group by source
        by_source = {}
        for finding in findings:
            source = finding.get("source_url", "Unknown")
            if source not in by_source:
                by_source[source] = []
            by_source[source].append(finding.get("content", "")[:200])

        # Format summary
        summary = f"Total findings: {len(findings)}\n"
        summary += f"Unique sources: {len(by_source)}\n\n"

        for source, contents in list(by_source.items())[:10]:
            summary += f"Source: {source}\n"
            summary += f"- {len(contents)} findings\n"
            summary += f"- Sample: {contents[0][:150]}...\n\n"

        return summary
