"""PMAS backend test suite.

Requires a real PostgreSQL test database (the models use PostgreSQL-specific
types: UUID, JSONB, native enums). Set DATABASE_URL before running:

    DATABASE_URL=postgresql+asyncpg://pmas:pmas@localhost:5432/pmas_test pytest

Safety: the URL must point at a database whose name contains "test" —
these tests DROP AND RECREATE every table on each run.
"""
import os
import pathlib
import sys
from urllib.parse import urlsplit

# ── Safety gate: never run against a non-test database ───────
DATABASE_URL = os.environ.get("DATABASE_URL", "")
if not DATABASE_URL:
    raise RuntimeError(
        "DATABASE_URL is not set. Point it at a THROWAWAY test PostgreSQL, "
        "e.g. postgresql+asyncpg://pmas:pmas@localhost:5432/pmas_test"
    )
_db_name = (urlsplit(DATABASE_URL).path or "/").lstrip("/").lower()
if "test" not in _db_name:
    raise RuntimeError(
        f"Refusing to run: database '{_db_name}' does not look like a test "
        "database (name must contain 'test'). These tests drop all tables."
    )

# ── App configuration (must be set BEFORE importing the app) ─
os.environ.setdefault("JWT_SECRET", "sandbox-and-ci-test-secret-not-for-any-real-use-000")
os.environ.setdefault("CORS_ORIGINS", "http://localhost")
os.environ.setdefault("PMAS_TIMEZONE", "Asia/Kolkata")

# Make backend/ importable (main.py, database.py, auth.py, schemas.py)
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parents[1]))

import pytest  # noqa: E402
import pytest_asyncio  # noqa: E402
from httpx import ASGITransport, AsyncClient  # noqa: E402


@pytest_asyncio.fixture
async def client():
    """Fresh app + fresh database schema for every test."""
    import main as app_module
    from database import Base, engine

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)

    transport = ASGITransport(app=app_module.app)
    async with AsyncClient(transport=transport, base_url="http://test") as c:
        yield c

    await engine.dispose()
