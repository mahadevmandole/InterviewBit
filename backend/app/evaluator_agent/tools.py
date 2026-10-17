import re
from typing import Any

from langchain_core.tools import tool


def _normalize_text(value: str) -> str:
    return re.sub(r'[^a-z0-9\s]+', ' ', value.lower()).strip()


@tool
def detect_filler_words(answer: str) -> dict[str, Any]:
    """Count filler words and judge whether the response sounds natural and focused."""
    if not answer or not answer.strip():
        return {'total': 0, 'unique_fillers': [], 'verdict': 'no answer provided', 'density': 0}

    normalized = _normalize_text(answer)
    tokens = normalized.split()
    filler_words = {
        'um', 'uh', 'like', 'basically', 'actually', 'literally', 'sorta', 'kinda',
        'you know', 'i mean', 'kind of', 'sort of', 'honestly', 'obviously'
    }

    matches: list[str] = []
    for phrase in sorted(filler_words, key=len, reverse=True):
        if ' ' in phrase:
            pattern = re.compile(rf'\b{re.escape(phrase)}\b')
            if pattern.search(normalized):
                matches.append(phrase)
        else:
            if phrase in tokens:
                matches.append(phrase)

    total = len(matches)
    density = round((total / max(len(tokens), 1)) * 100, 2)
    verdict = 'strong' if total <= 2 else 'needs tightening' if total <= 5 else 'too many fillers'
    return {'total': total, 'unique_fillers': sorted(set(matches)), 'verdict': verdict, 'density': density}


@tool
def check_star_structure(answer: str) -> dict[str, Any]:
    """Check whether a behavioral answer clearly includes Situation, Task, Action, and Result."""
    if not answer or not answer.strip():
        return {'all_present': False, 'missing': ['situation', 'task', 'action', 'result'], 'score': 0}

    normalized = answer.lower()
    stage_patterns = {
        'situation': r'\b(situation|when|while|in a project|at work|in my previous role)\b',
        'task': r'\b(task|goal|responsibility|needed to|had to|was expected to)\b',
        'action': r'\b(i (did|implemented|built|used|created|led|worked on)|we (did|implemented|built))\b',
        'result': r'\b(result|outcome|impact|improved|reduced|increased|achieved|delivered)\b',
    }

    present = {}
    missing = []
    for stage, pattern in stage_patterns.items():
        has_match = bool(re.search(pattern, normalized))
        present[stage] = has_match
        if not has_match:
            missing.append(stage)

    score = round((sum(1 for value in present.values() if value) / len(present)) * 100)
    return {
        'all_present': not missing,
        'missing': missing,
        'score': score,
        'coverage': present,
    }


@tool
def score_relevance(answer: str, expected_keywords: list[str]) -> dict[str, Any]:
    """Measure whether the answer addresses the important technical concepts for the question."""
    if not expected_keywords:
        return {'score': 100, 'matched': [], 'missed': [], 'coverage': 'no-keywords-configured'}

    normalized_answer = _normalize_text(answer)
    normalized_keywords = [
        {'raw': keyword, 'variants': {keyword.lower(), keyword.lower().replace('-', ' '), keyword.lower().replace('_', ' ')} }
        for keyword in expected_keywords
    ]

    matched = []
    missed = []
    for item in normalized_keywords:
        found = False
        for variant in item['variants']:
            if not variant:
                continue
            if variant in normalized_answer or re.search(rf'\b{re.escape(variant)}\b', normalized_answer):
                found = True
                matched.append(item['raw'])
                break
        if not found:
            missed.append(item['raw'])

    score = round((len(matched) / len(normalized_keywords)) * 100) if normalized_keywords else 100
    return {
        'score': min(100, max(0, score)),
        'matched': matched,
        'missed': missed,
        'coverage': 'good' if score >= 70 else 'partial' if score >= 40 else 'weak',
    }


@tool
def assess_communication_quality(answer: str) -> dict[str, Any]:
    """Measure clarity, structure, and reasoning quality in a candidate answer."""
    if not answer or not answer.strip():
        return {'score': 0, 'clarity': 'weak', 'reasoning_signals': []}

    sentences = [s.strip() for s in re.split(r'(?<=[.!?])\s+', answer.strip()) if s.strip()]
    word_count = len(answer.split())
    connectors = ['because', 'therefore', 'however', 'for example', 'so', 'which means', 'as a result']
    reasoning_signals = [signal for signal in connectors if signal in answer.lower()]
    examples = any(keyword in answer.lower() for keyword in ['for example', 'example', 'like', 'e.g.'])
    structure = len(sentences) >= 2
    length_score = min(100, max(0, round((word_count / 80) * 100)))
    signal_score = min(100, len(reasoning_signals) * 25 + (30 if examples else 0) + (25 if structure else 0))
    total_score = round((length_score * 0.4) + (signal_score * 0.6))

    return {
        'score': min(100, total_score),
        'clarity': 'strong' if total_score >= 70 else 'moderate' if total_score >= 40 else 'weak',
        'reasoning_signals': reasoning_signals,
        'sentence_count': len(sentences),
        'has_example': examples,
    }
