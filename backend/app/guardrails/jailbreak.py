import logging
import re
import time
import unicodedata

from app.core.request_context import request_id_context

logger = logging.getLogger(__name__)

_JAILBREAK_RULES = (
    (
        'instruction_override',
        re.compile(
            r'\b(?:ignore|disregard|forget|override)\b.{0,80}'
            r'\b(?:previous|prior|above|system|developer)\s+'
            r'(?:instructions?|rules?|prompts?|messages?)\b',
            re.IGNORECASE | re.DOTALL,
        ),
    ),
    (
        'system_prompt_exfiltration',
        re.compile(
            r'\b(?:reveal|show|print|repeat|disclose|quote|output)\b.{0,60}'
            r'\b(?:hidden\s+)?(?:system|developer)\s+'
            r'(?:prompts?|instructions?|messages?)\b',
            re.IGNORECASE | re.DOTALL,
        ),
    ),
    (
        'safety_bypass',
        re.compile(
            r'\b(?:bypass|disable|circumvent|override|turn\s+off|ignore)\b.{0,60}'
            r'\b(?:safety|content|moderation)\s+'
            r'(?:filters?|guardrails?|polic(?:y|ies)|rules?)\b',
            re.IGNORECASE | re.DOTALL,
        ),
    ),
    (
        'persona_override',
        re.compile(
            r'\b(?:act|pretend|roleplay)\s+(?:as|like)\b.{0,60}'
            r'\b(?:unrestricted|uncensored|jailbroken|developer\s+mode)\b',
            re.IGNORECASE | re.DOTALL,
        ),
    ),
)


class JailbreakDetectedError(ValueError):
    pass


def _iter_text_values(value: object):
    if isinstance(value, str):
        yield value
    elif isinstance(value, dict):
        for nested_value in value.values():
            yield from _iter_text_values(nested_value)
    elif isinstance(value, (list, tuple)):
        for nested_value in value:
            yield from _iter_text_values(nested_value)


def reject_jailbreak_data(value: object, *, operation: str) -> None:
    reject_jailbreak_input(
        '\n'.join(_iter_text_values(value)),
        operation=operation,
    )


def reject_jailbreak_input(text: str, *, operation: str) -> None:
    started_at = time.perf_counter()
    normalized = ''.join(
        character
        for character in unicodedata.normalize('NFKC', text)
        if unicodedata.category(character) != 'Cf'
    )
    matched_category = next(
        (category for category, pattern in _JAILBREAK_RULES if pattern.search(normalized)),
        None,
    )

    if matched_category:
        logger.warning(
            'ai_guardrail_check guardrail=jailbreak direction=input operation=%s decision=blocked category=%s duration_ms=%.2f request_id=%s',
            operation,
            matched_category,
            (time.perf_counter() - started_at) * 1000,
            request_id_context.get(),
        )
        raise JailbreakDetectedError('Input blocked by safety checks.')

    logger.info(
        'ai_guardrail_check guardrail=jailbreak direction=input operation=%s decision=passed duration_ms=%.2f request_id=%s',
        operation,
        (time.perf_counter() - started_at) * 1000,
        request_id_context.get(),
    )
