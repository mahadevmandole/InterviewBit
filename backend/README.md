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

## Local Ollama evaluator

Install Ollama and make sure its server is running, then pull the Gemma 3 270M model:

```sh
ollama pull gemma3:270m
```

Set `LLM_PROVIDER=ollama` and `OLLAMA_MODEL=gemma3:270m` in `backend/.env`. When running the backend directly on your machine, `OLLAMA_BASE_URL=http://localhost:11434/v1` is the default. With the root Docker Compose setup, the backend uses `http://host.docker.internal:11434/v1` to reach Ollama on the host; override `OLLAMA_BASE_URL` if Ollama runs elsewhere.

The Ollama path sends the question, candidate answer, and expected keywords to the model and asks for the same evaluation fields used by the API. The JSON response is validated by Pydantic. This path does not call the evaluator's scoring tools. Scores and feedback are still model-generated and may vary between runs; matching the response schema does not guarantee identical judgments across providers.

## Notes

- PostgreSQL is used for user tables, roles, credentials, and profiles.
- MongoDB is reserved for user test results, question answers, and test metadata.
- Cloud deployment configuration is intentionally not included in this boilerplate step.
