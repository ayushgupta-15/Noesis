"""
LangGraph workflow for AI research orchestration
Multi-agent collaborative research pipeline
"""
from typing import TypedDict, Annotated, List, Dict, Any
from langgraph.graph import StateGraph, END
from langgraph.prebuilt import ToolNode
from langchain_core.messages import BaseMessage, HumanMessage, AIMessage
import operator
import logging

from agents.query_agent import QueryGenerationAgent
from agents.search_agent import SearchAgent
from agents.analysis_agent import AnalysisAgent
from agents.validation_agent import ValidationAgent
from agents.report_agent import ReportGenerationAgent
from models import ResearchStatus

logger = logging.getLogger(__name__)


class ResearchState(TypedDict):
    """State definition for research workflow"""
    # Core data
    research_id: str
    topic: str
    clarifications: str
    user_id: str

    # Workflow state
    status: ResearchStatus
    iteration: int
    max_iterations: int

    # Research data
    queries: List[str]
    search_results: List[Dict[str, Any]]
    findings: Annotated[List[Dict[str, Any]], operator.add]
    processed_urls: Annotated[List[str], operator.add]

    # Analysis
    analysis: Dict[str, Any]
    validation: Dict[str, Any]
    sufficient: bool

    # Output
    report: str

    # Metadata
    messages: Annotated[List[BaseMessage], operator.add]
    metadata: Dict[str, Any]


class ResearchGraph:
    """LangGraph research workflow orchestrator"""

    def __init__(self):
        self.query_agent = QueryGenerationAgent()
        self.search_agent = SearchAgent()
        self.analysis_agent = AnalysisAgent()
        self.validation_agent = ValidationAgent()
        self.report_agent = ReportGenerationAgent()

        self.graph = self._build_graph()

    def _build_graph(self) -> StateGraph:
        """Build the research workflow graph"""

        workflow = StateGraph(ResearchState)

        # Add nodes
        workflow.add_node("generate_queries", self._generate_queries)
        workflow.add_node("search", self._search)
        workflow.add_node("analyze", self._analyze)
        workflow.add_node("validate", self._validate)
        workflow.add_node("generate_report", self._generate_report)

        # Define edges
        workflow.set_entry_point("generate_queries")

        workflow.add_edge("generate_queries", "search")
        workflow.add_edge("search", "analyze")
        workflow.add_edge("analyze", "validate")

        # Conditional routing after validation
        workflow.add_conditional_edges(
            "validate",
            self._should_continue,
            {
                "continue": "generate_queries",
                "finish": "generate_report"
            }
        )

        workflow.add_edge("generate_report", END)

        return workflow.compile()

    async def _generate_queries(self, state: ResearchState) -> ResearchState:
        """Generate search queries based on topic and current findings"""
        logger.info(f"Generating queries for iteration {state['iteration']}")

        state["status"] = ResearchStatus.GENERATING_QUERIES

        result = await self.query_agent.generate_queries(
            topic=state["topic"],
            clarifications=state["clarifications"],
            findings=state.get("findings", []),
            iteration=state["iteration"]
        )

        state["queries"] = result["queries"]
        state["messages"].append(
            AIMessage(content=f"Generated {len(result['queries'])} queries: {result['reasoning']}")
        )

        # Store explanation for copilot
        state["metadata"]["query_reasoning"] = result["reasoning"]

        return state

    async def _search(self, state: ResearchState) -> ResearchState:
        """Execute searches for generated queries"""
        logger.info(f"Executing {len(state['queries'])} searches")

        state["status"] = ResearchStatus.SEARCHING

        results = await self.search_agent.execute_searches(
            queries=state["queries"],
            processed_urls=state.get("processed_urls", [])
        )

        state["search_results"] = results

        # Extract and embed findings
        findings = await self.search_agent.process_results(
            results=results,
            research_id=state["research_id"]
        )

        state["findings"].extend(findings)
        state["processed_urls"].extend([r["url"] for r in results])

        state["messages"].append(
            AIMessage(content=f"Found {len(results)} new sources with {len(findings)} findings")
        )

        return state

    async def _analyze(self, state: ResearchState) -> ResearchState:
        """Analyze findings for coverage and gaps"""
        logger.info("Analyzing research findings")

        state["status"] = ResearchStatus.ANALYZING

        analysis = await self.analysis_agent.analyze_findings(
            topic=state["topic"],
            clarifications=state["clarifications"],
            findings=state["findings"],
            queries=state["queries"],
            iteration=state["iteration"]
        )

        state["analysis"] = analysis
        state["sufficient"] = analysis["sufficient"]

        state["messages"].append(
            AIMessage(content=f"Coverage: {analysis['coverage_score']:.2%}, Gaps: {len(analysis['gaps'])}")
        )

        # Store for copilot
        state["metadata"]["analysis_reasoning"] = analysis["reasoning"]

        return state

    async def _validate(self, state: ResearchState) -> ResearchState:
        """Validate findings for quality and accuracy"""
        logger.info("Validating research findings")

        state["status"] = ResearchStatus.VALIDATING

        validation = await self.validation_agent.validate_findings(
            findings=state["findings"],
            topic=state["topic"]
        )

        state["validation"] = validation

        # Override sufficient if validation fails
        if not validation["is_valid"]:
            state["sufficient"] = False

        state["messages"].append(
            AIMessage(content=f"Validation: {validation['confidence']:.2%} confidence")
        )

        return state

    def _should_continue(self, state: ResearchState) -> str:
        """Decide whether to continue research or generate report"""

        # Check if research is sufficient
        if state["sufficient"] and state["validation"].get("is_valid", False):
            logger.info("Research sufficient, generating report")
            return "finish"

        # Check iteration limit
        if state["iteration"] >= state["max_iterations"]:
            logger.info("Max iterations reached, generating report")
            return "finish"

        # Continue research
        state["iteration"] += 1
        logger.info(f"Continuing research, iteration {state['iteration']}")
        return "continue"

    async def _generate_report(self, state: ResearchState) -> ResearchState:
        """Generate final research report"""
        logger.info("Generating final report")

        state["status"] = ResearchStatus.GENERATING_REPORT

        report = await self.report_agent.generate_report(
            topic=state["topic"],
            clarifications=state["clarifications"],
            findings=state["findings"],
            analysis=state["analysis"],
            validation=state["validation"]
        )

        state["report"] = report
        state["status"] = ResearchStatus.COMPLETED

        state["messages"].append(
            AIMessage(content="Research completed successfully")
        )

        return state

    async def execute(self, initial_state: ResearchState):
        """Execute the research workflow"""
        logger.info(f"Starting research workflow for: {initial_state['topic']}")

        # Stream updates during execution
        async for output in self.graph.astream(initial_state):
            # Yield state updates for WebSocket streaming
            yield output
