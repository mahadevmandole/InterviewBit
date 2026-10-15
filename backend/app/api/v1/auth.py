from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_db
from app.repositories.user_repository import UserRepository
from app.schemas.auth import AuthUserResponse, TokenResponse
from app.schemas.user import UserCreate, UserLogin
from app.services.auth_service import AuthService

router = APIRouter(prefix='/auth', tags=['auth'])


async def get_auth_service(session: AsyncSession = Depends(get_db)) -> AuthService:
    repository = UserRepository(session)
    return AuthService(repository)


@router.post('/register', response_model=AuthUserResponse, status_code=status.HTTP_201_CREATED)
async def register_user(
    payload: UserCreate,
    auth_service: AuthService = Depends(get_auth_service),
):
    try:
        result = await auth_service.register(payload)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc

    return AuthUserResponse(**result)


@router.post('/login', response_model=TokenResponse)
async def login_user(
    payload: UserLogin,
    auth_service: AuthService = Depends(get_auth_service),
):
    try:
        result = await auth_service.login(payload)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(exc)) from exc

    return TokenResponse(**result)
