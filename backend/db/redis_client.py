"""
Redis client for caching intermediate results
"""
import redis.asyncio as redis
import json
import pickle
from typing import Any, Optional
import logging

from config import settings

logger = logging.getLogger(__name__)

redis_client: Optional[redis.Redis] = None


async def init_redis():
    """Initialize Redis connection"""
    global redis_client

    redis_client = await redis.from_url(
        settings.REDIS_URL,
        encoding="utf-8",
        decode_responses=False
    )

    # Test connection
    await redis_client.ping()

    logger.info("Redis connection established")


async def close_redis():
    """Close Redis connection"""
    if redis_client:
        await redis_client.close()
        logger.info("Redis connection closed")


async def cache_set(key: str, value: Any, ttl: Optional[int] = None) -> bool:
    """Set cache value with optional TTL"""
    try:
        # Serialize complex objects
        if isinstance(value, (dict, list)):
            serialized = json.dumps(value)
        else:
            serialized = pickle.dumps(value)

        if ttl:
            await redis_client.setex(key, ttl, serialized)
        else:
            await redis_client.set(key, serialized)

        return True

    except Exception as e:
        logger.error(f"Error setting cache key {key}: {str(e)}")
        return False


async def cache_get(key: str) -> Optional[Any]:
    """Get cache value"""
    try:
        value = await redis_client.get(key)

        if value is None:
            return None

        # Try JSON first, fall back to pickle
        try:
            return json.loads(value)
        except (json.JSONDecodeError, TypeError):
            return pickle.loads(value)

    except Exception as e:
        logger.error(f"Error getting cache key {key}: {str(e)}")
        return None


async def cache_delete(key: str) -> bool:
    """Delete cache key"""
    try:
        await redis_client.delete(key)
        return True
    except Exception as e:
        logger.error(f"Error deleting cache key {key}: {str(e)}")
        return False


async def cache_exists(key: str) -> bool:
    """Check if cache key exists"""
    try:
        return await redis_client.exists(key) > 0
    except Exception as e:
        logger.error(f"Error checking cache key {key}: {str(e)}")
        return False


async def increment_counter(key: str) -> int:
    """Increment counter"""
    try:
        return await redis_client.incr(key)
    except Exception as e:
        logger.error(f"Error incrementing counter {key}: {str(e)}")
        return 0


async def cache_search_results(query: str, results: list, ttl: int = 3600) -> bool:
    """Cache search results for query"""
    key = f"search:{hash(query)}"
    return await cache_set(key, results, ttl)


async def get_cached_search_results(query: str) -> Optional[list]:
    """Get cached search results"""
    key = f"search:{hash(query)}"
    return await cache_get(key)


async def cache_embedding(text: str, embedding: list, ttl: int = 86400) -> bool:
    """Cache text embedding"""
    key = f"embedding:{hash(text)}"
    return await cache_set(key, embedding, ttl)


async def get_cached_embedding(text: str) -> Optional[list]:
    """Get cached embedding"""
    key = f"embedding:{hash(text)}"
    return await cache_get(key)
