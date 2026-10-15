# InterviewBit Backend

This backend is a FastAPI service for PostgreSQL-backed user/account data and MongoDB-backed interview practice metadata.

## Structure

- `app/` - application package
- `alembic/` - database migration scripts
- `.env.example` - example environment variables

## Local development

1. Create a virtual environment.
2. Install dependencies.
3. Copy `.env.example` to `.env` and update values.
4. Run the app using `uvicorn app.main:app --reload`.

## Notes

- PostgreSQL is used for user tables, roles, credentials, and profiles.
- MongoDB is reserved for user test results, question answers, and test metadata.
- Cloud deployment configuration is intentionally not included in this boilerplate step.
