import asyncio
import ssl
from logging.config import fileConfig
from sqlalchemy.pool import NullPool
from sqlalchemy.ext.asyncio import create_async_engine
from alembic import context
from app.core.config import settings
from app.core.database import Base
import app.models  # noqa: F401 - registers all models

config = context.config
config.set_main_option("sqlalchemy.url", settings.DATABASE_URL.replace("%", "%%"))
if config.config_file_name is not None:
    fileConfig(config.config_file_name)
target_metadata = Base.metadata

_is_production = settings.APP_ENV == "production"

def _make_engine():
    """Build async engine with same SSL settings as database.py."""
    url = settings.DATABASE_URL
    if _is_production and "pooler.supabase.com:5432/" in url:
        url = url.replace("pooler.supabase.com:5432/", "pooler.supabase.com:6543/")

    connect_args: dict = {}
    if _is_production:
        ssl_ctx = ssl.create_default_context()
        ssl_ctx.check_hostname = False
        ssl_ctx.verify_mode = ssl.CERT_NONE
        connect_args = {
            "ssl": ssl_ctx,
            "prepared_statement_cache_size": 0,
            "timeout": 15,
            "command_timeout": 30,
        }

    return create_async_engine(url, poolclass=NullPool, connect_args=connect_args)


def do_run_migrations(connection):
    context.configure(connection=connection, target_metadata=target_metadata)
    with context.begin_transaction():
        context.run_migrations()


async def run_async_migrations():
    engine = _make_engine()
    async with engine.connect() as connection:
        await connection.run_sync(do_run_migrations)
    await engine.dispose()


def run_migrations_online():
    asyncio.run(run_async_migrations())


run_migrations_online()
