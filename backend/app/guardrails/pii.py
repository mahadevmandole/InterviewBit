import json
import logging
import time
from pathlib import Path
from typing import Any, Literal, TypeVar

from pydantic import BaseModel

from app.core.request_context import request_id_context
from app.guardrails.jailbreak import reject_jailbreak_data

logger = logging.getLogger(__name__)
ModelT = TypeVar('ModelT', bound=BaseModel)
GuardrailDirection = Literal['input', 'output']
_CONFIG_PATH = Path(__file__).with_name('nemo_pii')
_guardrails = None


class PiiGuardrailError(RuntimeError):
    pass


class PiiInputValidationError(PiiGuardrailError):
    pass


async def initialize_pii_guardrails() -> None:
    await mask_text(
        'PII guardrail startup check',
        direction='input',
        operation='startup',
    )


def _get_guardrails():
    global _guardrails
    if _guardrails is None:
        try:
            from nemoguardrails import Guardrails, RailsConfig

            config = RailsConfig.from_path(str(_CONFIG_PATH))
            _guardrails = Guardrails(config, use_iorails=True, require_iorails=True)
        except Exception as exc:
            logger.error(
                'ai_guardrail_initialization_failed guardrail=pii error_type=%s request_id=%s',
                type(exc).__name__,
                request_id_context.get(),
            )
            raise PiiGuardrailError('The PII guardrail could not be initialized.') from exc
    return _guardrails


async def mask_text(
    text: str,
    *,
    direction: GuardrailDirection,
    operation: str,
) -> str:
    started_at = time.perf_counter()
    try:
        result = await _get_guardrails().check_async(
            [{'role': 'user' if direction == 'input' else 'assistant', 'content': text}]
        )
        status = getattr(result.status, 'value', str(result.status)).lower()
        if status.endswith('blocked') or not isinstance(result.content, str):
            logger.warning(
                'ai_guardrail_check guardrail=pii direction=%s operation=%s decision=blocked request_id=%s',
                direction,
                operation,
                request_id_context.get(),
            )
            raise PiiGuardrailError('The PII guardrail blocked the content.')
    except PiiGuardrailError:
        raise
    except Exception as exc:
        logger.error(
            'ai_guardrail_check_failed guardrail=pii direction=%s operation=%s error_type=%s request_id=%s',
            direction,
            operation,
            type(exc).__name__,
            request_id_context.get(),
        )
        raise PiiGuardrailError('The PII guardrail check failed.') from exc

    logger.info(
        'ai_guardrail_check guardrail=pii direction=%s operation=%s decision=%s duration_ms=%.2f request_id=%s',
        direction,
        operation,
        status,
        (time.perf_counter() - started_at) * 1000,
        request_id_context.get(),
    )
    return result.content


async def mask_input_model(payload: ModelT, *, operation: str) -> ModelT:
    reject_jailbreak_data(payload.model_dump(mode='python'), operation=operation)
    serialized = payload.model_dump_json()
    masked = await mask_text(
        serialized,
        direction='input',
        operation=operation,
    )
    try:
        return type(payload).model_validate_json(masked)
    except Exception as exc:
        logger.error(
            'ai_guardrail_revalidation_failed guardrail=pii direction=input operation=%s error_type=%s request_id=%s',
            operation,
            type(exc).__name__,
            request_id_context.get(),
        )
        raise PiiInputValidationError('Masked input failed validation.') from exc


async def mask_output_data(payload: object, *, operation: str) -> Any:
    try:
        serialized = json.dumps(payload, ensure_ascii=False, default=str)
    except (TypeError, ValueError) as exc:
        logger.error(
            'ai_guardrail_serialization_failed guardrail=pii direction=output operation=%s error_type=%s request_id=%s',
            operation,
            type(exc).__name__,
            request_id_context.get(),
        )
        raise PiiGuardrailError('Generated output could not be checked for PII.') from exc

    masked = await mask_text(serialized, direction='output', operation=operation)
    try:
        return json.loads(masked)
    except json.JSONDecodeError as exc:
        logger.error(
            'ai_guardrail_revalidation_failed guardrail=pii direction=output operation=%s error_type=%s request_id=%s',
            operation,
            type(exc).__name__,
            request_id_context.get(),
        )
        raise PiiGuardrailError('Masked output failed validation.') from exc
