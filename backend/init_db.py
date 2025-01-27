import asyncio
import logging
from sqlalchemy import text
from src.database.config import Base, engine
from src.models import (
    User,
    Team,
    team_members,
    Project,
    Task,
    Comment,
    Notification
)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def create_tables():
    try:
        async with engine.begin() as conn:
            # Drop all tables with CASCADE
            await conn.execute(text('DROP SCHEMA IF EXISTS public CASCADE'))
            await conn.execute(text('CREATE SCHEMA public'))
            logger.info("Schema recreated")

            # Create tables in correct order
            await conn.run_sync(Base.metadata.create_all)
            logger.info("Tables created successfully")

    except Exception as e:
        logger.error(f"Database initialization failed: {e}")
        raise

if __name__ == "__main__":
    try:
        asyncio.run(create_tables())
        logger.info("Database initialization completed")
    except Exception as e:
        logger.error(f"Failed to initialize database: {e}")
        raise 