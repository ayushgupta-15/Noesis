"""
FastAPI backend for Noesis AI Research Agent
Enterprise-grade AI orchestration with LangGraph
"""
from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from contextlib import asynccontextmanager
import logging
import json
from typing import AsyncGenerator

from config import settings
from models import ResearchRequest, ResearchResponse, HealthResponse
from agents.orchestrator import ResearchOrchestrator
from db.postgres import init_db as init_postgres
from db.neo4j_client import init_db as init_neo4j
from db.redis_client import init_redis, close_redis
from utils.logger import setup_logger

logger = setup_logger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifecycle management for database connections"""
    logger.info("Starting Noesis Backend...")

    # Initialize databases
    await init_postgres()
    await init_neo4j()
    await init_redis()

    logger.info("All services initialized successfully")
    yield

    # Cleanup
    logger.info("Shutting down Noesis Backend...")
    await close_redis()


app = FastAPI(
    title="Noesis AI Research Agent",
    description="Enterprise-grade AI research orchestration with LangGraph",
    version="2.0.0",
    lifespan=lifespan
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/", response_model=HealthResponse)
async def root():
    """Health check endpoint"""
    return HealthResponse(
        status="healthy",
        version="2.0.0",
        environment=settings.ENVIRONMENT
    )


@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Detailed health check"""
    return HealthResponse(
        status="healthy",
        version="2.0.0",
        environment=settings.ENVIRONMENT
    )


@app.post("/api/research", response_model=ResearchResponse)
async def create_research(request: ResearchRequest):
    """
    Initiate a new research task
    Returns a research_id for tracking
    """
    try:
        orchestrator = ResearchOrchestrator()
        research_id = await orchestrator.initialize_research(
            topic=request.topic,
            clarifications=request.clarifications,
            user_id=request.user_id
        )

        return ResearchResponse(
            research_id=research_id,
            status="initialized",
            message="Research task created successfully"
        )

    except Exception as e:
        logger.error(f"Error creating research: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@app.websocket("/api/research/stream/{research_id}")
async def research_stream(websocket: WebSocket, research_id: str):
    """
    WebSocket endpoint for real-time research progress streaming
    """
    await websocket.accept()

    try:
        orchestrator = ResearchOrchestrator()

        async for update in orchestrator.execute_research(research_id):
            await websocket.send_json(update)

        await websocket.close()

    except WebSocketDisconnect:
        logger.info(f"WebSocket disconnected for research {research_id}")
    except Exception as e:
        logger.error(f"Error in research stream: {str(e)}")
        await websocket.send_json({
            "type": "error",
            "message": str(e)
        })
        await websocket.close()


@app.get("/api/research/{research_id}")
async def get_research(research_id: str):
    """
    Get research status and results
    """
    try:
        orchestrator = ResearchOrchestrator()
        result = await orchestrator.get_research_result(research_id)

        if not result:
            raise HTTPException(status_code=404, detail="Research not found")

        return result

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error retrieving research: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/research/{research_id}/export/{format}")
async def export_research(research_id: str, format: str):
    """
    Export research report to PDF or CSV
    """
    if format not in ["pdf", "csv"]:
        raise HTTPException(status_code=400, detail="Format must be 'pdf' or 'csv'")

    try:
        orchestrator = ResearchOrchestrator()

        if format == "pdf":
            from utils.export import generate_pdf
            pdf_content = await generate_pdf(research_id)

            return StreamingResponse(
                pdf_content,
                media_type="application/pdf",
                headers={"Content-Disposition": f"attachment; filename=research_{research_id}.pdf"}
            )

        else:  # csv
            from utils.export import generate_csv
            csv_content = await generate_csv(research_id)

            return StreamingResponse(
                csv_content,
                media_type="text/csv",
                headers={"Content-Disposition": f"attachment; filename=research_{research_id}.csv"}
            )

    except Exception as e:
        logger.error(f"Error exporting research: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/analytics/{research_id}")
async def get_analytics(research_id: str):
    """
    Get analytics for a research task
    """
    try:
        orchestrator = ResearchOrchestrator()
        analytics = await orchestrator.get_analytics(research_id)

        if not analytics:
            raise HTTPException(status_code=404, detail="Analytics not found")

        return analytics

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error retrieving analytics: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.ENVIRONMENT == "development"
    )
