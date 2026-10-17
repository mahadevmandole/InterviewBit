import json
from typing import Any

from redis.asyncio import Redis

from app.core.config import settings


class RedisService:
    def __init__(self, url: str) -> None:
        self.client = Redis.from_url(url, decode_responses=True)

    async def get_session(self, key: str) -> dict[str, Any]:
        raw = await self.client.get(key)
        if not raw:
            return {}
        try:
            value = json.loads(raw)
            return value if isinstance(value, dict) else {}
        except json.JSONDecodeError:
            return {}

    async def set_session(self, key: str, payload: dict[str, Any]) -> dict[str, Any]:
        await self.client.set(key, json.dumps(payload))
        return payload

    async def delete_session(self, key: str) -> None:
        await self.client.delete(key)

    async def ping(self) -> dict[str, str]:
        return {'status': 'ok', 'database': 'redis'}


redis_service = RedisService(settings.REDIS_URL)
