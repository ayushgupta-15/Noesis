"""
Search Agent
Executes searches using Exa API and processes results
"""
from typing import List, Dict, Any
import httpx
from langchain_openai import OpenAIEmbeddings
import logging

from config import settings
from db.redis_client import (
    cache_search_results, get_cached_search_results,
    cache_embedding, get_cached_embedding, increment_counter
)
from db.postgres import save_finding
from db.neo4j_client import add_source_to_research, extract_and_link_concepts

logger = logging.getLogger(__name__)


class SearchAgent:
    """Agent specialized in web search and result processing"""

    def __init__(self):
        self.exa_api_key = settings.EXA_API_KEY
        self.embeddings = OpenAIEmbeddings(
            model=settings.EMBEDDING_MODEL,
            api_key=settings.OPENAI_API_KEY
        )

    async def execute_searches(
        self,
        queries: List[str],
        processed_urls: List[str]
    ) -> List[Dict[str, Any]]:
        """Execute parallel searches for all queries"""

        all_results = []

        for query in queries[:settings.MAX_CONCURRENT_SEARCHES]:
            # Check cache first
            cached = await get_cached_search_results(query)
            if cached:
                logger.info(f"Cache hit for query: {query}")
                await increment_counter("cache_hits")
                all_results.extend(cached)
                continue

            # Execute search
            results = await self._search_exa(query)

            # Filter out already processed URLs
            new_results = [
                r for r in results
                if r["url"] not in processed_urls
            ]

            # Cache results
            await cache_search_results(query, new_results)

            all_results.extend(new_results)

        logger.info(f"Found {len(all_results)} total search results")

        return all_results

    async def _search_exa(self, query: str) -> List[Dict[str, Any]]:
        """Execute Exa search"""

        url = "https://api.exa.ai/search"

        headers = {
            "accept": "application/json",
            "content-type": "application/json",
            "x-api-key": self.exa_api_key
        }

        payload = {
            "query": query,
            "num_results": settings.MAX_SEARCH_RESULTS,
            "type": "neural",
            "contents": {
                "text": True
            }
        }

        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(url, headers=headers, json=payload, timeout=30.0)
                response.raise_for_status()

                data = response.json()

                results = []
                for item in data.get("results", []):
                    results.append({
                        "url": item.get("url"),
                        "title": item.get("title", ""),
                        "content": item.get("text", ""),
                        "published_date": item.get("publishedDate"),
                        "relevance_score": item.get("score", 0.5)
                    })

                return results

        except Exception as e:
            logger.error(f"Error searching Exa for '{query}': {str(e)}")
            return []

    async def process_results(
        self,
        results: List[Dict[str, Any]],
        research_id: str
    ) -> List[Dict[str, Any]]:
        """Process search results: embed, store, and link in knowledge graph"""

        findings = []

        for result in results:
            try:
                # Generate embedding
                content = result["content"][:2000]  # Limit content length
                embedding = await self._get_embedding(content)

                # Save finding to PostgreSQL
                finding_id = await save_finding(
                    research_id=research_id,
                    content=content,
                    source_url=result["url"],
                    relevance_score=result["relevance_score"],
                    embedding=embedding,
                    metadata={
                        "title": result["title"],
                        "published_date": result.get("published_date")
                    }
                )

                # Add to Neo4j knowledge graph
                await add_source_to_research(
                    research_id=research_id,
                    url=result["url"],
                    title=result["title"],
                    relevance_score=result["relevance_score"],
                    content_snippet=content[:500]
                )

                # Extract key concepts (simple keyword extraction)
                concepts = await self._extract_concepts(content)
                await extract_and_link_concepts(research_id, concepts, result["url"])

                findings.append({
                    "id": finding_id,
                    "content": content,
                    "source_url": result["url"],
                    "relevance_score": result["relevance_score"],
                    "embedding": embedding
                })

            except Exception as e:
                logger.error(f"Error processing result {result.get('url')}: {str(e)}")
                continue

        logger.info(f"Processed {len(findings)} findings")

        return findings

    async def _get_embedding(self, text: str) -> List[float]:
        """Get embedding with caching"""

        # Check cache
        cached = await get_cached_embedding(text)
        if cached:
            await increment_counter("cache_hits")
            return cached

        # Generate embedding
        embedding = await self.embeddings.aembed_query(text)

        # Cache
        await cache_embedding(text, embedding)

        return embedding

    async def _extract_concepts(self, text: str) -> List[str]:
        """Extract key concepts from text (simplified)"""

        # In production, use NER or LLM-based extraction
        # For now, simple approach
        words = text.lower().split()

        # Filter for likely concepts (length > 4, not common words)
        common_words = {"that", "this", "with", "from", "have", "what", "when", "where"}

        concepts = [
            word.strip(".,!?;:")
            for word in words
            if len(word) > 4 and word not in common_words
        ]

        # Return top 10 unique concepts
        return list(set(concepts))[:10]
