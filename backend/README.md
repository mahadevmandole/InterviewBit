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
4. Download the local PII recognition model: `python -m spacy download en_core_web_lg`.
5. Run the app using `uvicorn app.main:app --reload`.

## PII guardrails and AI observability

The backend uses NeMo Guardrails 0.25 with its Presidio integration to mask names, email
addresses, phone numbers, payment cards, US SSNs, locations, IP addresses, IBANs, and common
Indian identity numbers (Aadhaar, PAN, passport, voter ID, GSTIN, and vehicle registration)
on AI-bound inputs and generated outputs. Presidio and the `en_core_web_lg` model run locally;
raw text is not sent to a separate PII-detection service. Masked answers are what get saved
to interview sessions, so original identifiers are not retained in new interview records.
PII detection is probabilistic; review the configured categories and threshold for your
jurisdiction and risk level.

Incoming AI requests also pass through a local jailbreak heuristic that blocks common
instruction-override, prompt-exfiltration, safety-bypass, and unrestricted-persona attempts
before PII processing or model calls. This is a conservative first-line filter, not a
comprehensive prompt-injection detector; novel or obfuscated attacks can evade it. NeMo's
perplexity-based jailbreak rail is not enabled because it is not supported by the IORails
engine used here and requires a separate detector/model deployment for production use.

Each HTTP request receives an `X-Request-ID`. Backend logs record the route, status, duration,
and PII-rail decision without logging request or model content. Use the ID to correlate a
client error with backend logs. LangSmith tracing captures model inputs and outputs; inputs
are masked before model calls, but generated output can be captured before the output rail
masks it. Keep `LANGSMITH_TRACING` disabled unless that tracing destination is approved for
the data and retention policy.

## Local Ollama evaluator

Install Ollama and make sure its server is running, then pull the Gemma 3 270M model:

```sh
ollama pull gemma3:270m
```

Set `LLM_PROVIDER=ollama` and `OLLAMA_MODEL=gemma3:270m` in `backend/.env`. When running the backend directly on your machine, `OLLAMA_BASE_URL=http://localhost:11434/v1` is the default. With the root Docker Compose setup, the backend uses `http://host.docker.internal:11434/v1` to reach Ollama on the host; override `OLLAMA_BASE_URL` if Ollama runs elsewhere.

The Ollama path sends the question, candidate answer, and expected keywords to the model and asks for the same evaluation fields used by the API. The JSON response is validated by Pydantic. This path does not call the evaluator's scoring tools. Scores and feedback are still model-generated and may vary between runs; matching the response schema does not guarantee identical judgments across providers.

## LangSmith tracing

Set `LANGSMITH_TRACING=true` in `backend/.env` to enable LangChain tracing, or set it to `false` to disable tracing. Configure `LANGSMITH_API_KEY`, `LANGSMITH_PROJECT`, and `LANGSMITH_ENDPOINT` in the same file; the endpoint defaults to `https://api.smith.langchain.com`. The project is `InterviewBit` by default. The base Docker Compose backend service passes this file into the container, and `docker-compose.cloud.yml` inherits that configuration.

Tracing sends model inputs and outputs to LangSmith. Inputs include masked answer text; model
outputs may be captured before the output rail masks them. Enable tracing only when that
data-sharing and retention are approved. For deployments, set these variables in the backend's
environment or secret store.

## Notes

- PostgreSQL is used for user tables, roles, credentials, and profiles.
- MongoDB is reserved for user test results, question answers, and test metadata.
- Cloud deployment configuration is intentionally not included in this boilerplate step.
