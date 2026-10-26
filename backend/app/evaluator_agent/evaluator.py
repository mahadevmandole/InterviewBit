import os
import re
import logging
from typing import Any

from langchain_core.messages import HumanMessage, SystemMessage
from pydantic import ValidationError

from app.evaluator_agent.llm import build_llm
from app.evaluator_agent.llm import get_llm_provider
from app.core.config import settings
from app.evaluator_agent.schemas import AnswerEvaluationResponse
from app.evaluator_agent.tools import (
    assess_communication_quality,
    check_star_structure,
    detect_filler_words,
    score_relevance,
)

logger = logging.getLogger(__name__)

STOP_WORDS = {
    'the', 'a', 'an', 'and', 'or', 'but', 'if', 'then', 'when', 'what', 'why', 'how', 'which',
    'where', 'who', 'that', 'this', 'these', 'those', 'into', 'for', 'from', 'with', 'your',
    'about', 'under', 'over', 'after', 'before', 'while', 'through', 'against', 'between',
    'without', 'their', 'them', 'have', 'has', 'had', 'been', 'being', 'should', 'could', 'would',
    'can', 'you', 'we', 'they', 'it', 'its', 'is', 'are', 'was', 'were', 'as', 'of', 'to', 'on',
    'in', 'at', 'by', 'be', 'do', 'does', 'did', 'not', 'more', 'most', 'very', 'using', 'used',
    'work', 'works', 'working', 'like', 'just', 'also', 'example', 'examples'
}


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


def evaluate_answer(question: str, answer: str, expected_keywords: list[str] | None = None) -> dict[str, Any]:
    provider = get_llm_provider()
    if provider == 'ollama':
        expected_keywords = []
        llm = build_llm()
        logger.info('Starting answer evaluation provider=%s model=%s', provider, llm.model)
        prompt = (
            'Evaluate the candidate answer as a technical interview coach. Return one JSON object matching the requested schema. '
            'Assess the answer yourself; do not invoke tools or claim tool-derived results. Use the same fields and score ranges '
            'as the supplied evaluation format. Include concise, specific feedback in 2 to 4 sentences. '
            f'Response JSON schema: {AnswerEvaluationResponse.model_json_schema()}\n'
            f'Question: {question}\nCandidate answer: {answer}'
        )
        try:
            response = llm.bind(response_format={'type': 'json_object'}).invoke([
                SystemMessage(content='You are a strict but encouraging technical interview evaluator. Output only valid JSON.'),
                HumanMessage(content=prompt),
            ])
            content = response.content if hasattr(response, 'content') else str(response)
            if isinstance(content, list):
                content = ''.join(part.get('text', '') if isinstance(part, dict) else str(part) for part in content)
            evaluation = AnswerEvaluationResponse.model_validate_json(str(content))
            logger.info('Answer evaluation completed provider=%s model=%s', provider, llm.model)
            return evaluation.model_dump()
        except ValidationError as exc:
            logger.exception('Answer evaluation returned invalid output provider=%s model=%s', provider, llm.model)
            raise RuntimeError(
                f'Ollama model "{llm.model}" returned an invalid evaluation response: {exc}'
            ) from exc
        except Exception as exc:
            logger.exception('Answer evaluation failed provider=%s model=%s', provider, llm.model)
            raise RuntimeError(
                f'Ollama evaluation failed for model "{llm.model}" at '
                f'"{os.getenv("OLLAMA_BASE_URL") or settings.OLLAMA_BASE_URL}": '
                f'{type(exc).__name__}: {exc}'
            ) from exc

    expected_keywords = [
        str(keyword).strip()
        for keyword in (expected_keywords or [])
        if str(keyword).strip()
    ]

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

    llm = build_llm()
    logger.info('Starting answer feedback generation provider=%s model=%s', provider, llm.model)
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
        logger.info('Answer feedback generated provider=%s model=%s', provider, llm.model)
    except (TypeError, ValueError, AttributeError):
        logger.exception('Answer feedback generation failed provider=%s model=%s', provider, llm.model)
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
