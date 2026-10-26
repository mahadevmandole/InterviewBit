from __future__ import annotations

from datetime import UTC, datetime
from typing import Any

from app.db.mongo import mongo_service
from app.evaluator_agent.evaluator import evaluate_answer
from app.services.redis_service import redis_service


class InterviewSessionService:
    @staticmethod
    def _session_key(user_id: str, technology_id: str) -> str:
        return f'interview_session:{user_id}:{technology_id}'

    async def list_user_sessions(self, user_id: str) -> list[dict[str, Any]]:
        return await mongo_service.list_interview_sessions(user_id=user_id)

    async def get_user_session(self, user_id: str, session_id: str) -> dict[str, Any] | None:
        return await mongo_service.get_interview_session(user_id=user_id, session_id=session_id)

    async def save_answer(
        self,
        user_id: str,
        technology_id: str,
        question_id: int,
        question: str,
        answer: str,
        current_answers: list[dict[str, Any]] | None = None,
    ) -> dict[str, Any]:
        session_key = self._session_key(user_id, technology_id)
        existing = await redis_service.get_session(session_key)
        answers = existing.get('answers', []) if isinstance(existing.get('answers'), list) else []
        merged = {str(item.get('question_id')): item for item in answers if isinstance(item, dict)}
        merged[str(question_id)] = {
            'question_id': question_id,
            'question': question,
            'answer': answer,
            'submitted_at': datetime.now(UTC).isoformat(),
        }
        payload = {
            'user_id': user_id,
            'technology_id': technology_id,
            'updated_at': datetime.now(UTC).isoformat(),
            'answers': list(merged.values()),
        }
        await redis_service.set_session(session_key, payload)
        return payload

    async def submit_test(
        self,
        user_id: str,
        technology_id: str,
        answers: list[dict[str, Any]],
        questions: list[dict[str, Any]],
    ) -> dict[str, Any]:
        session_key = self._session_key(user_id, technology_id)
        session = await redis_service.get_session(session_key)
        normalized_answers = []
        collected = {str(item.get('question_id')): item for item in answers if isinstance(item, dict)}

        for question in questions:
            qid = str(question.get('id'))
            current = collected.get(qid, {})
            answer_text = current.get('answer') or ''
            evaluation = evaluate_answer(
                question=question.get('title') or question.get('question') or '',
                answer=answer_text,
                expected_keywords=(question.get('expected_keywords') or []),
            )
            normalized_answers.append(
                {
                    'question_id': int(qid),
                    'question': question.get('title') or question.get('question') or '',
                    'prompt': question.get('prompt') or '',
                    'answer': answer_text,
                    'submitted_at': current.get('submitted_at') or datetime.now(UTC).isoformat(),
                    'evaluation': evaluation,
                }
            )

        final_document = {
            'user_id': user_id,
            'technology_id': technology_id,
            'status': 'completed',
            'submitted_at': datetime.now(UTC).isoformat(),
            'session_key': session_key,
            'questions': normalized_answers,
            'session_snapshot': session,
        }

        result = await mongo_service.insert_interview_session(final_document)
        final_document['_id'] = str(result.inserted_id)
        await redis_service.delete_session(session_key)
        return final_document


interview_session_service = InterviewSessionService()
