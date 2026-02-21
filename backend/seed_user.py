"""
Seed a test user directly into the local database.
Run with:  python seed_user.py
"""
import asyncio
import sys, os

# Make sure app imports resolve
sys.path.insert(0, os.path.dirname(__file__))

from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import engine, Base, SessionLocal
from app.models.user import User, UserRole
from app.models.profile import JobSeekerProfile, EmployerProfile
from app.core.security import get_password_hash

TEST_USERS = [
    {
        "email": "seeker@test.com",
        "password": "test1234",
        "full_name": "Test Seeker",
        "role": UserRole.JOB_SEEKER,
        "profile": {"skills": ["Python", "React"], "location": "Mumbai"},
    },
    {
        "email": "employer@test.com",
        "password": "test1234",
        "full_name": "Test Employer",
        "role": UserRole.EMPLOYER,
        "employer_profile": {"company_name": "Test Corp", "location": "Bangalore"},
    },
]

async def seed():
    # Create tables first
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with SessionLocal() as db:
        for u in TEST_USERS:
            # Check if already exists
            from sqlalchemy import select
            result = await db.execute(select(User).where(User.email == u["email"]))
            existing = result.scalars().first()
            if existing:
                print(f"[SKIP] {u['email']} already exists.")
                continue

            user = User(
                email=u["email"],
                hashed_password=get_password_hash(u["password"]),
                full_name=u["full_name"],
                role=u["role"],
            )
            db.add(user)
            await db.flush()

            if u["role"] == UserRole.JOB_SEEKER and "profile" in u:
                profile = JobSeekerProfile(user_id=user.id, **u["profile"])
                db.add(profile)
            elif u["role"] == UserRole.EMPLOYER and "employer_profile" in u:
                ep = EmployerProfile(user_id=user.id, **u["employer_profile"])
                db.add(ep)

            await db.commit()
            print(f"[OK] Created: {u['email']} / {u['password']}")

    print("\n=== Done! ===")
    print("Login with:")
    for u in TEST_USERS:
        print(f"  Email: {u['email']}  |  Password: {u['password']}")

if __name__ == "__main__":
    asyncio.run(seed())
