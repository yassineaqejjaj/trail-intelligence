from sqlalchemy import create_engine

import app.models  # noqa: F401
from alembic import context
from app.core.config import get_settings
from app.core.db import Base

target_metadata = Base.metadata


def run():
    engine = create_engine(get_settings().sqlalchemy_url)
    with engine.connect() as conn:
        context.configure(connection=conn, target_metadata=target_metadata)
        with context.begin_transaction():
            context.run_migrations()


run()
