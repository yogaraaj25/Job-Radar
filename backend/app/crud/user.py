from typing import Optional, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from app.models.user import User, UserRole
from app.core.security import get_password_hash, verify_password

async def get_user_by_email(db: AsyncSession, email: str) -> Optional[User]:
    result = await db.execute(
        select(User)
        .where(User.email == email)
        .options(selectinload(User.seeker_profile), selectinload(User.employer_profile))
    )
    return result.scalars().first()

from app.models.profile import JobSeekerProfile, EmployerProfile

async def create_user(
    db: AsyncSession, 
    *, 
    email: str, 
    password: str, 
    full_name: Optional[str] = None, 
    role: UserRole = UserRole.JOB_SEEKER,
    job_seeker_in: Optional[dict] = None,
    employer_in: Optional[dict] = None
) -> User:
    db_user = User(
        email=email,
        hashed_password=get_password_hash(password),
        full_name=full_name,
        role=role
    )
    db.add(db_user)
    await db.flush()  # Get ID before profile creation

    if role == UserRole.JOB_SEEKER:
        profile_data = job_seeker_in or {}
        db_profile = JobSeekerProfile(user_id=db_user.id, **profile_data)
        db.add(db_profile)
    elif role == UserRole.EMPLOYER:
        profile_data = employer_in or {}
        db_profile = EmployerProfile(user_id=db_user.id, **profile_data)
        db.add(db_profile)

    await db.commit()
    
    # Re-fetch with relationships to avoid DetachedInstanceError during serialization
    result = await db.execute(
        select(User)
        .where(User.id == db_user.id)
        .options(selectinload(User.seeker_profile), selectinload(User.employer_profile))
    )
    return result.scalars().first()

async def authenticate_user(db: AsyncSession, email: str, password: str) -> Optional[User]:
    user = await get_user_by_email(db, email)
    if not user:
        return None
    if not verify_password(password, user.hashed_password):
        return None
    return user
