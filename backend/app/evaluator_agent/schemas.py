from typing import Any

from pydantic import BaseModel, Field, field_validator


class FillerWordsEvaluation(BaseModel):
    total: int = Field(..., ge=0)
    unique_fillers: list[str] = Field(default_factory=list)
    verdict: str
    density: float = Field(..., ge=0)


class StarEvaluation(BaseModel):
    score: int = Field(..., ge=0, le=100)
    all_present: bool
    missing: list[str] = Field(default_factory=list)
    coverage: dict[str, bool]


class RelevanceEvaluation(BaseModel):
    score: int = Field(..., ge=0, le=100)
    matched: list[str] = Field(default_factory=list)
    missed: list[str] = Field(default_factory=list)
    coverage: str
    keyword_hits: list[str] = Field(default_factory=list)
    missed_keywords: list[str] = Field(default_factory=list)
    question_term_hits: list[str] = Field(default_factory=list)
    question_term_coverage: int = Field(..., ge=0, le=100)


class CommunicationEvaluation(BaseModel):
    score: int = Field(..., ge=0, le=100)
    clarity: str
    reasoning_signals: list[str] = Field(default_factory=list)
    sentence_count: int = Field(..., ge=0)
    has_example: bool


class AnswerEvaluationResponse(BaseModel):
    question: str
    answer: str
    filler_words: FillerWordsEvaluation
    star_structure: StarEvaluation
    relevance: RelevanceEvaluation
    communication_quality: CommunicationEvaluation
    overall_score: int = Field(..., ge=0, le=100)
    feedback: str = Field(..., min_length=1)


class GeneratedQuestionModel(BaseModel):
    id: int = Field(..., ge=1)
    title: str = Field(..., min_length=1)
    prompt: str = Field(..., min_length=1)
    difficulty: str = Field(default='Medium')
    expected_keywords: Any = None

    @field_validator('difficulty')
    @classmethod
    def validate_difficulty(cls, value: str) -> str:
        normalized = value.strip()
        valid_values = {'Easy', 'Medium', 'Hard'}
        if normalized not in valid_values:
            raise ValueError(f'Difficulty must be one of {sorted(valid_values)}')
        return normalized

class GeneratedQuestionsResponseModel(BaseModel):
    questions: list[GeneratedQuestionModel] = Field(default_factory=list)
