from pydantic import BaseModel, ConfigDict, EmailStr, Field


class UserLogin(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8)


class UserCreate(UserLogin):
    first_name: str | None = None
    last_name: str | None = None
    phone: str | None = None


class UserRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    email: EmailStr
    is_active: bool
    is_verified: bool
