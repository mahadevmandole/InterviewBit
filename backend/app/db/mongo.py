from typing import Any

from app.core.config import settings


class MongoService:
    def __init__(self, uri: str, database_name: str) -> None:
        self.uri = uri
        self.database_name = database_name

    async def ping(self) -> dict[str, Any]:
        return {'status': 'not_configured', 'database': self.database_name}


mongo_service = MongoService(
    uri=settings.MONGODB_URI,
    database_name=settings.MONGODB_DB,
)
