import os
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


def evaluate_answer(question: str, answer: str, expected_keywords: list[str] | None = None) -> dict[str, Any]:
    expected_keywords = expected_keywords or []
    filler_result = detect_filler_words.invoke({'answer': answer})
    star_result = check_star_structure.invoke({'answer': answer})
    relevance_result = score_relevance.invoke({
        'answer': answer,
        'expected_keywords': expected_keywords,
    })
    communication_result = assess_communication_quality.invoke({'answer': answer})

    filler_score = max(0, 100 - (filler_result['total'] * 12))
    weighted_score = round(
        
            relevance_result['score'] * 0.4
            + star_result['score'] * 0.25
            + communication_result['score'] * 0.2
            + filler_score * 0.15
        
    )

    llm = _build_llm()
    response = llm.invoke(
        [
            SystemMessage(
                content=(
                    'You are a rigorous interview evaluator. Provide short, encouraging and actionable '
                    'feedback. Keep it specific to the question and discuss concrete strengths and gaps.'
                )
            ),
            HumanMessage(
                content=(
                    f'Question: {question}\n'
                    f'Expected keywords: {expected_keywords or "None specified"}\n'
                    f'Candidate answer: {answer}\n\n'
                    f'Use the evaluation metrics below to contextualize feedback: '
                    f'filler words={filler_result}, STAR={star_result}, relevance={relevance_result}, '
                    f'communication={communication_result}. '
                    f'Give 2-4 short sentences of feedback that feel like an interview coach.'
                )
            ),
        ]
    )

    return {
        'question': question,
        'answer': answer,
        'filler_words': filler_result,
        'star_structure': star_result,
        'relevance': relevance_result,
        'communication_quality': communication_result,
        'overall_score': min(100, max(0, weighted_score)),
        'feedback': response.content,
    }
