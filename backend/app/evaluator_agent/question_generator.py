import json
import os
import re
from typing import Any

from dotenv import find_dotenv, load_dotenv
from langchain_core.messages import HumanMessage
from langchain_openai import ChatOpenAI
from pydantic import ValidationError

from app.core.config import settings
from app.evaluator_agent.schemas import GeneratedQuestionModel

load_dotenv(find_dotenv(), override=True)


def _build_llm() -> ChatOpenAI:
    provider = (os.getenv('LLM_PROVIDER') or settings.LLM_PROVIDER or 'grok').lower()

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


def _extract_json_text(raw: str) -> str:
    match = re.search(r'```(?:json)?\s*(\[.*\]|\{.*\})\s*```', raw, re.DOTALL | re.IGNORECASE)
    if match:
        return match.group(1)
    cleaned = raw.strip()
    if cleaned.startswith(('[' , '{')):
        return cleaned
    return raw


def _fallback_questions(technology: str, experience_level: str, count: int) -> list[dict[str, Any]]:
    base = [
        f'Explain core concepts in {technology}',
        f'Walk through a real-world {technology} project you have built',
        f'Describe trade-offs and design choices in {technology}',
        f'How would you debug a production issue in {technology}?',
        f'What are the common pitfalls in {technology} applications?',
        f'How would you improve performance and reliability in {technology}?',
        f'Compare the main patterns and tools used in {technology}',
        f'How do you handle testing, validation, and edge cases in {technology}?',
        f'What metrics or monitoring would you use in {technology}?',
        f'How would you explain the architecture of a {technology} solution to a team?',
    ]
    questions = []
    for index, title in enumerate(base[:count], start=1):
        questions.append({
            'id': index,
            'title': title,
            'prompt': f'Answer at a {experience_level.lower()} level and explain practical examples.',
            'difficulty': 'Easy' if index <= 3 else 'Medium' if index <= 7 else 'Hard',
            'expected_keywords': [technology.lower(), 'architecture', 'debugging', 'scalability', 'testing', 'performance', 'tradeoffs', 'monitoring', 'reliability', 'design'],
        })
    return questions


def _normalize_generated_questions(payload: Any, technology: str, experience_level: str, count: int) -> list[dict[str, Any]]:
    if isinstance(payload, dict):
        candidate = payload.get('questions')
        if isinstance(candidate, list):
            payload = candidate
        elif isinstance(payload.get('data'), list):
            payload = payload.get('data')
        else:
            return []

    if not isinstance(payload, list):
        return []

    normalized: list[dict[str, Any]] = []
    for index, item in enumerate(payload, start=1):
        if not isinstance(item, dict):
            continue

        candidate = {
            'id': int(item.get('id', index)),
            'title': str(item.get('title', f'Question {index}')).strip(),
            'prompt': str(item.get('prompt', '')).strip(),
            'difficulty': str(item.get('difficulty', 'Medium')).strip() or 'Medium',
            'expected_keywords': item.get('expected_keywords') or [],
        }

        if isinstance(candidate['expected_keywords'], str):
            candidate['expected_keywords'] = [candidate['expected_keywords']]

        try:
            validated = GeneratedQuestionModel.model_validate(candidate)
        except ValidationError:
            continue

        normalized.append(validated.model_dump())

    if not normalized:
        return _fallback_questions(technology, experience_level, count)
    return normalized[:count]


def generate_interview_questions(technology: str, experience_level: str, count: int = 10) -> list[dict[str, Any]]:
    technology = (technology or 'software engineering').strip()
    experience_level = (experience_level or 'Beginner').strip() or 'Beginner'
    if not technology:
        return []

    llm = _build_llm()
    prompt = (
        f'Generate {count} interview questions for a {experience_level.lower()} candidate in {technology}. '
        'Return valid JSON only in this exact shape: {"questions":[{"id":1,"title":"...","prompt":"...","difficulty":"Easy","expected_keywords":["keyword1","keyword2",...]}]}. '
        'Each question should be realistic for a technical interview. '
        'For each question, expected_keywords must be a list of 10 to 15 unique technical keywords or concepts, directly relevant to the question and answer. '
        'Use a meaningful difficulty value from ["Easy", "Medium", "Hard"]. '
        'Do not wrap the object in markdown or prose.'
    )

    try:
        response = llm.invoke([HumanMessage(content=prompt)])
        text = response.content if hasattr(response, 'content') else str(response)
        json_text = _extract_json_text(text)
        payload = json.loads(json_text)
        normalized = _normalize_generated_questions(payload, technology, experience_level, count)
        if normalized:
            return normalized
    except (TypeError, ValueError, AttributeError):
        pass

    return _fallback_questions(technology, experience_level, count)
