from fastapi import APIRouter, HTTPException, Request, status
from pydantic import BaseModel, Field

from app.core.security import token_service
from app.evaluator_agent.question_generator import generate_interview_questions
from app.evaluator_agent.schemas import (
    GeneratedQuestionModel,
    GeneratedQuestionsResponseModel,
)
from app.services.interview_service import interview_session_service

router = APIRouter(prefix='/interviews', tags=['interviews'])


class AnswerPayload(BaseModel):
    question_id: int = Field(..., ge=1)
    question: str
    answer: str


class SubmitInterviewPayload(BaseModel):
    answers: list[AnswerPayload]
    questions: list[GeneratedQuestionModel] = Field(default_factory=list)


class GenerateQuestionsPayload(BaseModel):
    technology: str = Field(..., min_length=1)
    experience_level: str = Field(default='Beginner', min_length=1)
    count: int = Field(default=10, ge=5, le=15)


def get_user_id_from_request(request: Request) -> str:
    auth_header = request.headers.get('Authorization', '')
    if not auth_header.startswith('Bearer '):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail='Authentication required to save your interview answers.',
        )

    token = auth_header.replace('Bearer ', '', 1).strip()
    try:
        payload = token_service.verify_access_token(token)
    except Exception as exc:  # pragma: no cover - JWT decode edge-case
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail='Your session has expired. Please sign in again.',
        ) from exc

    user_id = payload.get('sub')
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail='User session is invalid.',
        )
    return str(user_id)


@router.post('/questions', status_code=status.HTTP_200_OK)
async def generate_questions(payload: GenerateQuestionsPayload):
    questions = generate_interview_questions(
        technology=payload.technology,
        experience_level=payload.experience_level,
        count=payload.count,
    )
    validated_response = GeneratedQuestionsResponseModel(questions=questions)
    return validated_response.model_dump()


@router.get('/sessions', status_code=status.HTTP_200_OK)
async def list_user_sessions(request: Request):
    user_id = get_user_id_from_request(request)
    sessions = await interview_session_service.list_user_sessions(user_id=user_id)
    return {'sessions': sessions}


@router.get('/sessions/{session_id}', status_code=status.HTTP_200_OK)
async def get_user_session(request: Request, session_id: str):
    user_id = get_user_id_from_request(request)
    session = await interview_session_service.get_user_session(user_id=user_id, session_id=session_id)
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail='Interview session not found.',
        )
    return {'session': session}


@router.post('/sessions/{technology_id}/answers', status_code=status.HTTP_200_OK)
async def save_answer(
    request: Request,
    technology_id: str,
    payload: AnswerPayload,
):
    user_id = get_user_id_from_request(request)
    session = await interview_session_service.save_answer(
        user_id=user_id,
        technology_id=technology_id,
        question_id=payload.question_id,
        question=payload.question,
        answer=payload.answer,
    )
    return {'status': 'saved', 'session': session}


@router.post('/sessions/{technology_id}/submit', status_code=status.HTTP_200_OK)
async def submit_test(
    request: Request,
    technology_id: str,
    payload: SubmitInterviewPayload,
):
    user_id = get_user_id_from_request(request)
    if not payload.answers:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail='At least one answer is required before submitting the test.',
        )

    session = await interview_session_service.submit_test(
        user_id=user_id,
        technology_id=technology_id,
        answers=[answer.model_dump() for answer in payload.answers],
        questions=[question.model_dump() for question in payload.questions],
    )
    return {
        'status': 'completed',
        'message': 'You successfully completed the test.',
        'session': session,
    }
