import json
import logging
import re
from typing import Any

from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import PromptTemplate
from pydantic import ValidationError

from app.evaluator_agent.llm import build_llm, get_llm_provider
from app.evaluator_agent.schemas import GeneratedQuestionModel

logger = logging.getLogger(__name__)


def _extract_json_text(raw: str) -> str:
    match = re.search(r'```(?:json)?\s*(\[.*\]|\{.*\})\s*```', raw, re.DOTALL | re.IGNORECASE)
    if match:
        return match.group(1)
    cleaned = raw.strip()
    if cleaned.startswith('```'):
        cleaned = re.sub(r'^```(?:json)?\s*', '', cleaned, count=1, flags=re.IGNORECASE)
        cleaned = re.sub(r'\s*```\s*$', '', cleaned)
    if cleaned.startswith(('[' , '{')):
        return cleaned
    return raw


def _parse_question_payload(raw: str) -> Any:
    json_text = _extract_json_text(raw)
    try:
        return json.loads(json_text)
    except json.JSONDecodeError as original_error:
        decoder = json.JSONDecoder()
        recovered = []
        cursor = 0
        while cursor < len(json_text):
            start = json_text.find('{', cursor)
            if start < 0:
                break
            try:
                value, end = decoder.raw_decode(json_text, start)
            except json.JSONDecodeError:
                cursor = start + 1
                continue
            cursor = end
            if isinstance(value, dict) and (value.get('title') or value.get('question')) and value.get('prompt'):
                recovered.append(value)
        if recovered:
            logger.warning('Recovered %s complete question objects from truncated or malformed model output.', len(recovered))
            return recovered
        def extract_string_fields(field: str) -> list[str]:
            values = []
            for match in re.finditer(rf'"{field}"\s*:\s*("(?:\\.|[^"\\])*")', json_text):
                try:
                    values.append(json.loads(match.group(1)))
                except json.JSONDecodeError:
                    continue
            return values

        questions = extract_string_fields('question')
        titles = extract_string_fields('title')
        prompts = extract_string_fields('prompt')
        if questions:
            recovered.extend({'question': value, 'prompt': value} for value in questions)
        else:
            recovered.extend(
                {'title': title, 'prompt': prompts[index] if index < len(prompts) else title}
                for index, title in enumerate(titles)
            )
            if not recovered:
                recovered.extend({'question': value, 'prompt': value} for value in prompts)
        if recovered:
            logger.warning('Recovered %s question text fields from truncated model output.', len(recovered))
            return recovered
        raise ValueError(f'Model output did not contain valid question JSON: {original_error}') from original_error

KEYWORD_STOP_WORDS = {
    'about', 'after', 'also', 'and', 'are', 'can', 'describe', 'does', 'each', 'explain',
    'for', 'from', 'how', 'into', 'like', 'provide', 'some', 'that', 'the', 'their',
    'these', 'this', 'using', 'what', 'when', 'which', 'with', 'would', 'your',
}


def _question_keywords(item: dict[str, Any]) -> list[str]:
    supplied = item.get('expected_keywords')
    if isinstance(supplied, str):
        supplied = [supplied]
    if isinstance(supplied, list):
        keywords = list(dict.fromkeys(str(value).strip() for value in supplied if str(value).strip()))
        if keywords:
            return keywords[:10]

    source = f"{item.get('title', '')} {item.get('prompt', '')}"
    keywords = []
    for token in re.findall(r'[A-Za-z][A-Za-z0-9+#.-]*', source):
        token = token.strip('.-').lower()
        if len(token) >= 3 and token not in KEYWORD_STOP_WORDS and token not in keywords:
            keywords.append(token)
        if len(keywords) == 5:
            break
    return keywords


def _fallback_questions(
    technology: str,
    experience_level: str,
    count: int,
    include_keywords: bool,
) -> list[dict[str, Any]]:
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
        f'How would you choose and use indexes in a {technology} application?',
        f'How would you test and troubleshoot a {technology} application?',
        f'How would you secure a {technology} application and its data?',
        f'How would you improve query performance in a {technology} application?',
        f'How would you migrate or scale a {technology} application safely?',
    ]
    questions = []
    for index, title in enumerate(base[:count], start=1):
        question = {
            'id': index,
            'title': title,
            'prompt': f'Answer at a {experience_level.lower()} level and explain practical examples.',
            'difficulty': 'Easy' if index <= 3 else 'Medium' if index <= 7 else 'Hard',
        }
        if include_keywords:
            question['expected_keywords'] = _question_keywords(question)
        questions.append(question)
    return questions


def _normalize_generated_questions(payload: Any, count: int, include_keywords: bool) -> list[dict[str, Any]]:
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
    seen_titles: set[str] = set()
    for index, item in enumerate(payload, start=1):
        if not isinstance(item, dict):
            continue

        try:
            question_id = int(item.get('id', index))
        except (TypeError, ValueError):
            question_id = index
        candidate = {
            'id': question_id if question_id > 0 else index,
            'title': str(item.get('title') or item.get('question') or f'Question {index}').strip(),
            'prompt': str(item.get('prompt') or item.get('question') or '').strip(),
            'difficulty': str(item.get('difficulty', 'Medium')).strip() or 'Medium',
        }
        title_key = re.sub(r'\W+', ' ', candidate['title'].casefold()).strip()
        if title_key in seen_titles:
            continue
        if not candidate['prompt'] or not candidate['prompt'].strip(' .…'):
            candidate['prompt'] = 'Explain your answer with relevant details and a concrete example.'
        if include_keywords:
            candidate['expected_keywords'] = _question_keywords({**item, **candidate})

        try:
            validated = GeneratedQuestionModel.model_validate(candidate)
        except ValidationError:
            continue

        question = validated.model_dump(exclude_none=True)
        normalized.append(question)
        seen_titles.add(title_key)

    return normalized[:count]


def _complete_question_count(questions: list[dict[str, Any]], technology: str, experience_level: str, count: int, include_keywords: bool) -> list[dict[str, Any]]:
    result = questions[:count]
    seen_titles = {str(question.get('title', '')).strip().casefold() for question in result}
    for fallback in _fallback_questions(technology, experience_level, count, include_keywords):
        title = fallback['title'].casefold()
        if title in seen_titles:
            continue
        fallback['id'] = len(result) + 1
        result.append(fallback)
        seen_titles.add(title)
        if len(result) >= count:
            break
    return result


def generate_interview_questions(technology: str, experience_level: str, count: int = 10) -> list[dict[str, Any]]:
    technology = (technology or 'software engineering').strip()
    experience_level = (experience_level or 'Beginner').strip() or 'Beginner'
    provider = get_llm_provider()
    include_keywords = provider != 'ollama'
    if not technology:
        return []

    output_shape = '{"questions":[{"id":1,"title":"...","prompt":"...","difficulty":"Easy"'
    if include_keywords:
        output_shape += ',"expected_keywords":["keyword1","keyword2"]'
    output_shape += '}]}'
    keyword_instruction = (
        'For each question, include 7 to 10 specific expected_keywords. '
        if include_keywords else 'Do not include an expected_keywords field. '
    )
    prompt_text = (
        f'Generate {count} interview questions for a {experience_level.lower()} candidate in {technology}. '
        f'Return one compact JSON object only in this exact shape: {output_shape}. '
        'Each question should be realistic for a technical interview. '
        'Use a different title and topic for every question. Keep each prompt to one or two sentences. '
        + keyword_instruction
        + 'Use a meaningful difficulty value from ["Easy", "Medium", "Hard"]. '
        'Do not wrap the object in markdown or prose.'
    )
    prompt = PromptTemplate.from_template('{request}')
    parser = StrOutputParser()

    try:
        llm = build_llm()
        provider = get_llm_provider()
        logger.info('Starting question generation provider=%s model=%s', provider, llm.model)
        model = llm.bind(response_format={'type': 'json_object'}, max_tokens=2048) if provider == 'ollama' else llm
        chain = prompt | model | parser
        text = chain.invoke({'request': prompt_text})
        payload = _parse_question_payload(text)
        normalized = _normalize_generated_questions(payload, count, include_keywords)
        if not normalized:
            raise ValueError('The model response contained no valid interview questions.')
        normalized = _complete_question_count(normalized, technology, experience_level, count, include_keywords)
        logger.info('Question generation completed provider=%s model=%s count=%s', provider, llm.model, len(normalized))
        return normalized
    except Exception:
        logger.exception('Interview question generation failed; provider=%s, fallback questions will be returned.', get_llm_provider())
        return _fallback_questions(technology, experience_level, count, include_keywords)
