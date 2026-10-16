from sqlalchemy import select
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User
from app.models.user_credentials import UserCredential
from app.models.user_profile import UserProfile
from app.schemas.user import UserCreate


class UserRepository:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def get_by_email(self, email: str) -> User | None:
        result = await self.session.execute(
            select(User)
            .options(selectinload(User.credentials))
            .where(User.email == email)
        )
        return result.scalar_one_or_none()

    async def create(self, user_data: UserCreate, password_hash: str) -> User:
        user = User(
            email=user_data.email,
            is_active=True,
            is_verified=False,
        )
        self.session.add(user)
        await self.session.flush()

        credential = UserCredential(user_id=user.id, password_hash=password_hash)
        profile = UserProfile(
            user_id=user.id,
            first_name=user_data.first_name,
            last_name=user_data.last_name,
            phone=user_data.phone,
        )

        self.session.add_all([credential, profile])
        await self.session.commit()
        await self.session.refresh(user)
        return user
