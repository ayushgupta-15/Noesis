"""
Pydantic models for request/response validation
"""
from pydantic import BaseModel, Field
from typing import List, Dict, Optional, Any
from datetime import datetime
from enum import Enum


class ResearchRequest(BaseModel):
    """Request model for initiating research"""
    topic: str = Field(..., min_length=3, max_length=500)
    clarifications: Dict[str, str] = Field(default_factory=dict)
    user_id: Optional[str] = None
    max_iterations: Optional[int] = None


class ResearchResponse(BaseModel):
    """Response model for research initiation"""
    research_id: str
    status: str
    message: str


class HealthResponse(BaseModel):
    """Health check response"""
    status: str
    version: str
    environment: str


class ResearchStatus(str, Enum):
    """Research task status"""
    INITIALIZED = "initialized"
    GENERATING_QUERIES = "generating_queries"
    SEARCHING = "searching"
    ANALYZING = "analyzing"
    VALIDATING = "validating"
    GENERATING_REPORT = "generating_report"
    COMPLETED = "completed"
    FAILED = "failed"


class ActivityType(str, Enum):
    """Activity types for tracking"""
    QUERY_GENERATION = "query_generation"
    SEARCH = "search"
    ANALYSIS = "analysis"
    VALIDATION = "validation"
    CACHE_HIT = "cache_hit"
    EMBEDDING = "embedding"
    GRAPH_UPDATE = "graph_update"


class StreamUpdate(BaseModel):
    """WebSocket stream update"""
    type: str
    timestamp: datetime
    data: Dict[str, Any]


class QueryGeneration(BaseModel):
    """Generated search queries"""
    queries: List[str]
    reasoning: str
    confidence: float


class SearchResult(BaseModel):
    """Search result from Exa"""
    url: str
    title: str
    content: str
    relevance_score: float
    published_date: Optional[str] = None


class Finding(BaseModel):
    """Research finding"""
    id: str
    content: str
    source_url: str
    relevance_score: float
    embedding: Optional[List[float]] = None
    metadata: Dict[str, Any] = Field(default_factory=dict)


class AnalysisResult(BaseModel):
    """Analysis result from analysis agent"""
    sufficient: bool
    coverage_score: float
    gaps: List[str]
    next_queries: List[str]
    reasoning: str


class ValidationResult(BaseModel):
    """Validation result"""
    is_valid: bool
    confidence: float
    concerns: List[str]
    suggestions: List[str]


class ResearchReport(BaseModel):
    """Final research report"""
    research_id: str
    topic: str
    executive_summary: str
    main_findings: List[Dict[str, Any]]
    conclusions: str
    sources: List[str]
    metadata: Dict[str, Any]
    created_at: datetime


class Analytics(BaseModel):
    """Research analytics"""
    research_id: str
    total_queries: int
    total_searches: int
    cache_hits: int
    cache_hit_rate: float
    total_tokens: int
    total_findings: int
    iterations_completed: int
    duration_seconds: float
    query_efficiency: float
    source_diversity: float
