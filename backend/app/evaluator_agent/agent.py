import os
import re
from typing import Any

from dotenv import find_dotenv, load_dotenv
from langchain_core.messages import HumanMessage, SystemMessage
from langchain_openai import ChatOpenAI

from app.core.config import settings
from app.evaluator_agent.tools import (
    assess_communication_quality,
    check_star_structure,
    detect_filler_words,
    score_relevance,
)

load_dotenv(find_dotenv(), override=True)

STOP_WORDS = {
    'the', 'a', 'an', 'and', 'or', 'but', 'if', 'then', 'when', 'what', 'why', 'how', 'which',
    'where', 'who', 'that', 'this', 'these', 'those', 'into', 'for', 'from', 'with', 'your',
    'about', 'under', 'over', 'after', 'before', 'while', 'through', 'against', 'between',
    'without', 'their', 'them', 'have', 'has', 'had', 'been', 'being', 'should', 'could', 'would',
    'can', 'you', 'we', 'they', 'it', 'its', 'is', 'are', 'was', 'were', 'as', 'of', 'to', 'on',
    'in', 'at', 'by', 'be', 'do', 'does', 'did', 'not', 'more', 'most', 'very', 'using', 'used',
    'work', 'works', 'working', 'like', 'just', 'also', 'example', 'examples'
}


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


def _normalize_keyword(value: str) -> str:
    cleaned = re.sub(r'[^a-z0-9\s_-]+', ' ', value.lower()).strip()
    return cleaned.replace('_', ' ').replace('-', ' ')


def _question_term_hits(question: str, answer: str) -> list[str]:
    if not question or not answer:
        return []

    question_terms = []
    for token in re.findall(r'[a-zA-Z0-9_]+', question.lower()):
        if len(token) <= 3 or token in STOP_WORDS:
            continue
        question_terms.append(token)

    normalized_answer = _normalize_keyword(answer)
    hits: list[str] = []
    for term in dict.fromkeys(question_terms):
        if re.search(rf'\b{re.escape(term)}\b', normalized_answer):
            hits.append(term)
    return hits


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


def evaluate_answer(question: str, answer: str, expected_keywords: list[str] | None = None) -> dict[str, Any]:
    expected_keywords = [keyword for keyword in (expected_keywords or []) if str(keyword).strip()]
    filler_result = detect_filler_words.invoke({'answer': answer})
    star_result = check_star_structure.invoke({'answer': answer})
    relevance_result = score_relevance.invoke({
        'answer': answer,
        'expected_keywords': expected_keywords,
    })
    communication_result = assess_communication_quality.invoke({'answer': answer})

    answer_terms = _question_term_hits(question, answer)
    keyword_hits = [keyword for keyword in expected_keywords if _normalize_keyword(keyword) in _normalize_keyword(answer)]
    keyword_score = round((len(keyword_hits) / max(len(expected_keywords), 1)) * 100) if expected_keywords else 100
    question_score = round((len(answer_terms) / max(len(dict.fromkeys(re.findall(r'[a-zA-Z0-9_]+', question.lower()))), 1)) * 100) if question.strip() else 100
    relevance_score = round((relevance_result['score'] * 0.7) + (min(100, keyword_score) * 0.3))
    overall_score = round(
        relevance_score * 0.55
        + star_result['score'] * 0.15
        + communication_result['score'] * 0.15
        + max(0, 100 - (filler_result['total'] * 12)) * 0.15
    )

    missed_keywords = [keyword for keyword in expected_keywords if keyword not in keyword_hits]
    missing_question_terms = [term for term in dict.fromkeys(re.findall(r'[a-zA-Z0-9_]+', question.lower())) if term not in answer_terms][:5]

    llm = _build_llm()
    missing_question_terms = [term for term in dict.fromkeys(re.findall(r'[a-zA-Z0-9_]+', question.lower())) if term not in answer_terms][:5]
    feedback_prompt = (
        f'Question: {question}\n'
        f'Expected keywords: {expected_keywords or "None specified"}\n'
        f'Candidate answer: {answer}\n\n'
        f'Use these evaluation metrics: filler words={filler_result}, STAR={star_result}, relevance={relevance_result}, '
        f'communication={communication_result}. '
        f'Missing question focus terms: {missing_question_terms or "none observed"}. '
        'Write 2 to 4 concise sentences of interview feedback. Mention what is correct, what is missing, and what to improve. '
        'Keep it hopeful and specific to the question.'
    )

    try:
        response = llm.invoke([
            SystemMessage(content='You are a strict but encouraging technical interview coach.'),
            HumanMessage(content=feedback_prompt),
        ])
        feedback = response.content if hasattr(response, 'content') else str(response)
    except (TypeError, ValueError, AttributeError):
        feedback = 'The answer is directionally correct but needs sharper coverage of the key concepts in the question.'

    if not feedback or not str(feedback).strip():
        feedback = 'The answer is directionally correct but needs sharper coverage of the key concepts in the question.'

    return {
        'question': question,
        'answer': answer,
        'filler_words': filler_result,
        'star_structure': star_result,
        'relevance': {
            **relevance_result,
            'keyword_hits': keyword_hits,
            'missed_keywords': missed_keywords,
            'question_term_hits': answer_terms,
            'question_term_coverage': question_score,
        },
        'communication_quality': communication_result,
        'overall_score': min(100, max(0, overall_score)),
        'feedback': feedback,
    }
