import logging
import traceback
from contextlib import asynccontextmanager
from time import perf_counter
from uuid import uuid4

from fastapi import FastAPI, HTTPException, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app import models  # noqa: F401 - register models with SQLAlchemy metadata
from app.api.v1.auth import router as auth_router
from app.api.v1.health import router as health_router
from app.api.v1.interviews import router as interview_router
from app.core.config import settings
from app.core.request_context import request_id_context
from app.db.base import Base
from app.db.session import database_manager
from app.guardrails.jailbreak import JailbreakDetectedError
from app.guardrails.pii import PiiInputValidationError, initialize_pii_guardrails

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(name)s: %(message)s",
)

logger = logging.getLogger(__name__)


class ApplicationFactory:
    def __init__(self, app_settings) -> None:
        self.settings = app_settings

    def create_app(self) -> FastAPI:
        @asynccontextmanager
        async def lifespan(_: FastAPI):
            await initialize_pii_guardrails()
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
            expose_headers=['X-Request-ID'],
        )

        @app.middleware('http')
        async def observe_request(request: Request, call_next):
            request_id = str(uuid4())
            request_token = request_id_context.set(request_id)
            started_at = perf_counter()
            try:
                response = await call_next(request)
                response.headers['X-Request-ID'] = request_id
                route = request.scope.get('route')
                route_path = getattr(route, 'path', 'unmatched')
                logger.info(
                    'http_request_complete request_id=%s method=%s route=%s status_code=%s duration_ms=%.2f',
                    request_id,
                    request.method,
                    route_path,
                    response.status_code,
                    (perf_counter() - started_at) * 1000,
                )
                return response
            finally:
                request_id_context.reset(request_token)

        app.include_router(health_router, prefix=self.settings.API_V1_STR)
        app.include_router(auth_router, prefix=self.settings.API_V1_STR)
        app.include_router(interview_router, prefix=self.settings.API_V1_STR)

        @app.exception_handler(RequestValidationError)
        async def validation_exception_handler(_: Request, exc: RequestValidationError):
            logger.warning(
                'request_validation_failed request_id=%s error_count=%s',
                request_id_context.get(),
                len(exc.errors()),
            )
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

        @app.exception_handler(JailbreakDetectedError)
        async def jailbreak_exception_handler(_: Request, __: JailbreakDetectedError):
            return JSONResponse(
                status_code=400,
                content={
                    'detail': 'Input blocked by safety checks.',
                    'request_id': request_id_context.get(),
                },
            )

        @app.exception_handler(PiiInputValidationError)
        async def pii_input_validation_exception_handler(
            _: Request,
            __: PiiInputValidationError,
        ):
            request_id = request_id_context.get()
            return JSONResponse(
                status_code=422,
                content={
                    'detail': (
                        'We could not safely validate your text after the privacy check. '
                        'Please rephrase it and try again. If the problem continues, contact support '
                        f'with request ID {request_id}.'
                    ),
                    'request_id': request_id,
                },
            )

        @app.exception_handler(Exception)
        async def unhandled_exception_handler(_: Request, exc: Exception):
            request_id = request_id_context.get()
            logger.error(
                'unhandled_api_error request_id=%s error_type=%s stack=%s',
                request_id,
                type(exc).__name__,
                ''.join(traceback.format_tb(exc.__traceback__)),
            )
            return JSONResponse(
                status_code=500,
                content={'detail': 'Unexpected server error.', 'request_id': request_id},
            )

        @app.get('/')
        def read_root() -> dict[str, str]:
            return {'message': 'Welcome to InterviewBit API'}

        return app


app = ApplicationFactory(settings).create_app()
