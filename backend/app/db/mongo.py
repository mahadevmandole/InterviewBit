from typing import Any

from motor.motor_asyncio import AsyncIOMotorClient

from app.core.config import settings


class MongoService:
    def __init__(self, uri: str, database_name: str) -> None:
        self.uri = uri
        self.database_name = database_name
        self.client = AsyncIOMotorClient(uri)
        self.database = self.client[database_name]

    async def ping(self) -> dict[str, Any]:
        try:
            await self.client.admin.command('ping')
            return {'status': 'ok', 'database': self.database_name}
        except Exception:
            return {'status': 'not_configured', 'database': self.database_name}

    async def insert_interview_session(self, payload: dict[str, Any]) -> Any:
        return await self.database.interview_sessions.insert_one(payload)


mongo_service = MongoService(
    uri=settings.MONGODB_URI,
    database_name=settings.MONGODB_DB,
)
