import os

from dotenv import find_dotenv, load_dotenv
from langchain_openai import ChatOpenAI

from app.core.config import settings

load_dotenv(find_dotenv(), override=True)


def build_llm() -> ChatOpenAI:
    provider = (os.getenv('LLM_PROVIDER') or settings.LLM_PROVIDER or 'grok').lower()

    if provider == 'ollama':
        return ChatOpenAI(
            model=os.getenv('OLLAMA_MODEL') or settings.OLLAMA_MODEL,
            api_key='ollama',
            base_url=os.getenv('OLLAMA_BASE_URL') or settings.OLLAMA_BASE_URL,
            temperature=0.2,
        )

    if provider == 'groq':
        model = os.getenv('GROQ_MODEL') or 'openai/gpt-oss-20b'
        return ChatOpenAI(
            model=model,
            api_key=os.getenv('GROQ_API_KEY') or settings.GROQ_API_KEY,
            base_url=os.getenv('GROQ_BASE_URL') or settings.GROQ_BASE_URL,
            temperature=0.2,
        )

    model = os.getenv('OPENAI_MODEL') or settings.LLM_MODEL or 'gpt-4o-mini'
    return ChatOpenAI(
        model=model,
        api_key=os.getenv('OPENAI_API_KEY') or settings.OPENAI_API_KEY,
        base_url=os.getenv('OPENAI_BASE_URL') or settings.OPENAI_BASE_URL,
        temperature=0.2,
    )
