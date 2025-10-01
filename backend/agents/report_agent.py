"""
Report Generation Agent
Generates comprehensive research reports
"""
from typing import Dict, Any, List
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
import logging

from config import settings

logger = logging.getLogger(__name__)


class ReportGenerationAgent:
    """Agent specialized in generating research reports"""

    def __init__(self):
        self.llm = ChatOpenAI(
            model=settings.DEFAULT_MODEL,
            temperature=0.5,
            max_tokens=4000,
            api_key=settings.OPENAI_API_KEY
        )

    async def generate_report(
        self,
        topic: str,
        clarifications: str,
        findings: List[Dict[str, Any]],
        analysis: Dict[str, Any],
        validation: Dict[str, Any]
    ) -> str:
        """Generate comprehensive research report"""

        findings_text = self._organize_findings(findings)

        prompt = ChatPromptTemplate.from_messages([
            ("system", """You are an expert research report writer. Create a comprehensive,
            well-structured research report based on the findings provided.

            Report structure:
            1. Executive Summary
            2. Introduction
            3. Methodology
            4. Key Findings (organized by theme)
            5. Analysis and Insights
            6. Conclusions
            7. Sources

            Use markdown formatting. Be thorough, objective, and cite sources."""),

            ("user", """Topic: {topic}

            Clarifications: {clarifications}

            Research Coverage: {coverage}%

            Validation Status: {validation_status}

            Findings ({count} total):
            {findings_text}

            Generate a comprehensive research report.""")
        ])

        chain = prompt | self.llm

        try:
            result = await chain.ainvoke({
                "topic": topic,
                "clarifications": clarifications,
                "coverage": int(analysis.get("coverage_score", 0) * 100),
                "validation_status": "Validated" if validation.get("is_valid") else "Requires Review",
                "findings_text": findings_text,
                "count": len(findings)
            })

            report = result.content

            logger.info(f"Generated report: {len(report)} characters")

            return report

        except Exception as e:
            logger.error(f"Error generating report: {str(e)}")
            # Minimal fallback report
            return f"""# Research Report: {topic}

## Error

Unable to generate full report due to error: {str(e)}

## Findings Summary

Total findings collected: {len(findings)}

Please review findings manually or retry report generation.
"""

    def _organize_findings(self, findings: List[Dict[str, Any]]) -> str:
        """Organize findings for report generation"""

        if not findings:
            return "No findings collected."

        # Group by source
        by_source = {}
        for finding in findings:
            source = finding.get("source_url", "Unknown")
            if source not in by_source:
                by_source[source] = []
            by_source[source].append(finding.get("content", ""))

        # Format organized findings
        formatted = []

        for source, contents in by_source.items():
            formatted.append(f"### Source: {source}")
            for i, content in enumerate(contents, 1):
                formatted.append(f"{i}. {content[:500]}...")
            formatted.append("")

        return "\n".join(formatted)
