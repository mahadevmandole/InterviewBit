from app.core.security import password_service, token_service
from app.repositories.user_repository import UserRepository
from app.schemas.user import UserCreate, UserLogin


class AuthService:
    def __init__(self, user_repository: UserRepository) -> None:
        self.user_repository = user_repository

    async def register(self, user_data: UserCreate) -> dict[str, str | int]:
        existing_user = await self.user_repository.get_by_email(user_data.email)
        if existing_user:
            raise ValueError('User with this email already exists.')

        hashed_password = password_service.hash_password(user_data.password)
        user = await self.user_repository.create(user_data, hashed_password)
        token = token_service.create_access_token(user.id)

        return {
            'user_id': user.id,
            'email': user.email,
            'access_token': token,
            'token_type': 'bearer',
        }

    async def login(self, credentials: UserLogin) -> dict[str, str]:
        user = await self.user_repository.get_by_email(credentials.email)
        if not user:
            raise ValueError('Invalid email or password.')

        stored_hash = user.credentials.password_hash
        if not password_service.verify_password(credentials.password, stored_hash):
            raise ValueError('Invalid email or password.')

        token = token_service.create_access_token(user.id)
        return {'access_token': token, 'token_type': 'bearer'}
