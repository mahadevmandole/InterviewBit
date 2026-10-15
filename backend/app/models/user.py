from datetime import datetime, timezone

from sqlalchemy import DateTime, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class User(Base):
    __tablename__ = 'users'

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    is_active: Mapped[bool] = mapped_column(default=True, nullable=False)
    is_verified: Mapped[bool] = mapped_column(default=False, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    role_id: Mapped[int | None] = mapped_column(ForeignKey('roles.id'), nullable=True)
    role: Mapped['Role'] = relationship(back_populates='users')

    credentials: Mapped['UserCredential'] = relationship(back_populates='user', uselist=False)
    profile: Mapped['UserProfile'] = relationship(back_populates='user', uselist=False)
