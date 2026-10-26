import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app import models  # noqa: F401 - register models with SQLAlchemy metadata
from app.api.v1.auth import router as auth_router
from app.api.v1.health import router as health_router
from app.api.v1.interviews import router as interview_router
from app.core.config import settings
from app.db.base import Base
from app.db.session import database_manager

logger = logging.getLogger(__name__)


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
        app.include_router(interview_router, prefix=self.settings.API_V1_STR)

        @app.exception_handler(RequestValidationError)
        async def validation_exception_handler(_: Request, exc: RequestValidationError):
            logger.warning('Request validation failed: %s', exc)
            reasons = [
                f"{'.'.join(str(part) for part in error.get('loc', ()) if part != 'body')}: {error.get('msg', 'invalid value')}"
                for error in exc.errors()
            ]
            message = 'Invalid request data: ' + '; '.join(reasons)
            return JSONResponse(
                status_code=422,
                content={'detail': message},
            )

        @app.exception_handler(HTTPException)
        async def http_exception_handler(_: Request, exc: HTTPException):
            detail = exc.detail
            message = detail if isinstance(detail, str) else str(detail)
            return JSONResponse(status_code=exc.status_code, content={'detail': message})

        @app.exception_handler(Exception)
        async def unhandled_exception_handler(_: Request, exc: Exception):
            logger.exception('Unhandled API error: %s', exc)
            return JSONResponse(
                status_code=500,
                content={'detail': f'{type(exc).__name__}: {exc}' or 'Unexpected server error.'},
            )

        @app.get('/')
        def read_root() -> dict[str, str]:
            return {'message': 'Welcome to InterviewBit API'}

        return app


app = ApplicationFactory(settings).create_app()
