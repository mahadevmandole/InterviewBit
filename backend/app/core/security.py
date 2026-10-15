from datetime import UTC, datetime, timedelta
from typing import Any

import jwt
from pwdlib import PasswordHash

from app.core.config import settings


class PasswordService:
    def __init__(self) -> None:
        self._hasher = PasswordHash.recommended()

    def hash_password(self, password: str) -> str:
        return self._hasher.hash(password)

    def verify_password(self, password: str, hashed_password: str) -> bool:
        return self._hasher.verify(password, hashed_password)


class TokenService:
    def __init__(self, secret_key: str, algorithm: str, expire_minutes: int) -> None:
        self.secret_key = secret_key
        self.algorithm = algorithm
        self.expire_minutes = expire_minutes

    def create_access_token(self, subject: str | int, expires_delta_minutes: int | None = None) -> str:
        expires = datetime.now(UTC) + timedelta(
            minutes=expires_delta_minutes or self.expire_minutes,
        )
        payload = {'sub': str(subject), 'exp': expires}
        return jwt.encode(payload, self.secret_key, algorithm=self.algorithm)

    def verify_access_token(self, token: str) -> dict[str, Any]:
        return jwt.decode(token, self.secret_key, algorithms=[self.algorithm])


password_service = PasswordService()
token_service = TokenService(
    secret_key=settings.JWT_SECRET_KEY,
    algorithm=settings.JWT_ALGORITHM,
    expire_minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES,
)
