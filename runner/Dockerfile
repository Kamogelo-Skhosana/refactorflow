FROM python:3.13-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

RUN useradd --system --uid 10001 --create-home runner \
    && python -m pip install --no-cache-dir "pytest==9.1.1" \
    && mkdir -p /sandbox \
    && chown -R runner:runner /sandbox

COPY --chown=runner:runner entrypoint.py /app/entrypoint.py

USER runner
WORKDIR /sandbox
ENTRYPOINT ["python", "/app/entrypoint.py"]

