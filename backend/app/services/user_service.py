from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.user_repository import UserRepository
from app.schemas.user import UserCreate


class UserService:
    def __init__(self, session: AsyncSession) -> None:
        self.repository = UserRepository(session)

    async def get_user_by_email(self, email: str):
        return await self.repository.get_by_email(email)

    async def create_user(self, user_data: UserCreate, password_hash: str):
        return await self.repository.create(user_data, password_hash)
