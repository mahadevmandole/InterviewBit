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

    async def list_interview_sessions(self, user_id: str, limit: int = 50) -> list[dict[str, Any]]:
        documents = await self.database.interview_sessions.find({'user_id': user_id}).sort('submitted_at', -1).to_list(length=limit)
        for document in documents:
            document['_id'] = str(document['_id'])
        return documents

    async def get_interview_session(self, user_id: str, session_id: str) -> dict[str, Any] | None:
        from bson.objectid import ObjectId

        try:
            document = await self.database.interview_sessions.find_one({'_id': ObjectId(session_id), 'user_id': user_id})
        except Exception:
            document = None

        if not document:
            return None

        document['_id'] = str(document['_id'])
        return document


mongo_service = MongoService(
    uri=settings.MONGODB_URI,
    database_name=settings.MONGODB_DB,
)
