from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1.auth import router as auth_router
from app.api.v1.health import router as health_router
from app.core.config import settings
from app.db.base import Base
from app.db.session import database_manager
from app import models  # noqa: F401 - register models with SQLAlchemy metadata


class ApplicationFactory:
    def __init__(self, app_settings) -> None:
        self.settings = app_settings

    def create_app(self) -> FastAPI:
        @asynccontextmanager
        async def lifespan(_: FastAPI):
            async with database_manager.engine.begin() as connection:
                await connection.run_sync(Base.metadata.create_all)
            yield

        app = FastAPI(
            title=self.settings.PROJECT_NAME,
            version='0.1.0',
            description='InterviewBit backend boilerplate for PostgreSQL and MongoDB workloads.',
            lifespan=lifespan,
        )

        app.add_middleware(
            CORSMiddleware,
            allow_origins=self.settings.BACKEND_CORS_ORIGINS,
            allow_credentials=True,
            allow_methods=['*'],
            allow_headers=['*'],
        )

        app.include_router(health_router, prefix=self.settings.API_V1_STR)
        app.include_router(auth_router, prefix=self.settings.API_V1_STR)

        @app.get('/')
        def read_root() -> dict[str, str]:
            return {'message': 'Welcome to InterviewBit API'}

        return app


app = ApplicationFactory(settings).create_app()
