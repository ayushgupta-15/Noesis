"""
Configuration management using Pydantic Settings
"""
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List


class Settings(BaseSettings):
    """Application settings"""

    # API Keys
    OPENAI_API_KEY: str
    ANTHROPIC_API_KEY: str = ""
    EXA_API_KEY: str

    # Database URLs
    DATABASE_URL: str
    NEO4J_URI: str
    NEO4J_USER: str
    NEO4J_PASSWORD: str
    REDIS_URL: str

    # Application Settings
    ENVIRONMENT: str = "development"
    LOG_LEVEL: str = "INFO"
    CORS_ORIGINS: List[str] = ["http://localhost:3000"]
    MAX_ITERATIONS: int = 5
    CACHE_TTL: int = 3600

    # Model Configuration
    DEFAULT_MODEL: str = "gpt-4o"
    EMBEDDING_MODEL: str = "text-embedding-3-small"
    TEMPERATURE: float = 0.7
    MAX_TOKENS: int = 4000

    # Research Configuration
    MAX_SEARCH_RESULTS: int = 10
    MAX_CONCURRENT_SEARCHES: int = 3
    SIMILARITY_THRESHOLD: float = 0.75

    model_config = SettingsConfigDict(
        env_file=".env",
        case_sensitive=True
    )


settings = Settings()
