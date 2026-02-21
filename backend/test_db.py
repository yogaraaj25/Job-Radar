import asyncio
import sys
import os

# Add the current directory to path so we can import 'app'
sys.path.append(os.getcwd())

from app.core.database import engine

async def test_connection():
    print(f"Testing connection to: {engine.url}")
    try:
        async with engine.connect() as conn:
            print("Successfully connected to the database!")
    except Exception as e:
        print(f"Failed to connect to the database: {e}")

if __name__ == "__main__":
    asyncio.run(test_connection())
