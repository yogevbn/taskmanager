import logging
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import declarative_base, sessionmaker
from sqlalchemy.pool import NullPool
import configparser
import os

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Database URL
DATABASE_URL = "postgresql+asyncpg://postgres:qweqwe@localhost:5432/taskmanager"

try:
    engine = create_async_engine(
        DATABASE_URL,
        poolclass=NullPool,
        echo=True,
    )

    AsyncSessionLocal = sessionmaker(
        engine,
        class_=AsyncSession,
        expire_on_commit=False
    )

    Base = declarative_base()

    async def get_db():
        async with AsyncSessionLocal() as session:
            try:
                yield session
                await session.commit()
            except Exception as e:
                logger.error(f"Database error: {e}")
                await session.rollback()
                raise

except Exception as e:
    logger.error(f"Failed to create engine: {e}")
    raise 