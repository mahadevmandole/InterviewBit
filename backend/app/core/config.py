from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class AppSettings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file='.env',
        env_file_encoding='utf-8',
        case_sensitive=False,
        extra='ignore',
    )

    PROJECT_NAME: str = 'InterviewBit API'
    ENVIRONMENT: str = 'development'
    API_V1_STR: str = '/api/v1'
    BACKEND_CORS_ORIGINS: list[str] = ['http://localhost:5173']

    POSTGRES_USER: str = 'postgres'
    POSTGRES_PASSWORD: str = 'postgres'
    POSTGRES_HOST: str = 'localhost'
    POSTGRES_PORT: int = 5432
    POSTGRES_DB: str = 'interviewbit'

    MONGODB_URI: str = 'mongodb://localhost:27017'
    MONGODB_DB: str = 'interviewbit'

    REDIS_URL: str = 'redis://localhost:6379/0'

    LLM_PROVIDER: str = 'openai'
    LLM_MODEL: str = 'gpt-4o-mini'
    GROK_API_KEY: str = ''
    OPENAI_API_KEY: str = ''
    OPENAI_BASE_URL: str = 'https://api.openai.com/v1'
    GROQ_API_KEY: str = ''
    GROQ_BASE_URL: str = 'https://api.groq.com/openai/v1'
    OLLAMA_BASE_URL: str = 'http://localhost:11434/v1'
    OLLAMA_MODEL: str = 'gemma3:270m'

    JWT_SECRET_KEY: str = 'change-me-in-production'
    JWT_ALGORITHM: str = 'HS256'
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    @property
    def postgres_dsn(self) -> str:
        return (
            f'postgresql+asyncpg://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@'
            f'{self.POSTGRES_HOST}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}'
        )

    @field_validator('BACKEND_CORS_ORIGINS', mode='before')
    @classmethod
    def parse_cors_origins(cls, value):
        if isinstance(value, str):
            raw = value.strip('[]').replace('"', '').replace("'", '')
            return [origin.strip() for origin in raw.split(',') if origin.strip()]
        return value


settings = AppSettings()
