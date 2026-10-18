from pydantic import BaseModel, Field, field_validator


class GeneratedQuestionModel(BaseModel):
    id: int = Field(..., ge=1)
    title: str = Field(..., min_length=1)
    prompt: str = Field(..., min_length=1)
    difficulty: str = Field(default='Medium')
    expected_keywords: list[str] = Field(default_factory=list)

    @field_validator('difficulty')
    @classmethod
    def validate_difficulty(cls, value: str) -> str:
        normalized = value.strip()
        valid_values = {'Easy', 'Medium', 'Hard'}
        if normalized not in valid_values:
            raise ValueError(f'Difficulty must be one of {sorted(valid_values)}')
        return normalized

    @field_validator('expected_keywords')
    @classmethod
    def validate_expected_keywords(cls, value: list[str]) -> list[str]:
        cleaned = [str(keyword).strip() for keyword in value if str(keyword).strip()]
        if not 10 <= len(cleaned) <= 15:
            raise ValueError('expected_keywords must contain between 10 and 15 keywords')
        return cleaned


class GeneratedQuestionsResponseModel(BaseModel):
    questions: list[GeneratedQuestionModel] = Field(default_factory=list)
