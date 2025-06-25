FROM ghcr.io/astral-sh/uv:python3.12-bookworm-slim

COPY . /app

WORKDIR /app

RUN uv sync --frozen

EXPOSE 8000

CMD ["uv", "run", "hypercorn", "main:app", "-b", "0.0.0.0:8000"]