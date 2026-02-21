from typing import List, Optional
import math
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_
from app.models.job import Job, JobType
from app.core.ai_processor import ai_processor

async def create_job(
    db: AsyncSession, 
    *, 
    title: str, 
    description: str, 
    employer_id: int, 
    job_type: JobType,
    latitude: float,
    longitude: float,
    is_urgent: bool = False,
    required_skills: Optional[List[str]] = None,
    experience_years: Optional[int] = None
) -> Job:
    # Auto-extract if not provided
    if not required_skills:
        required_skills = ai_processor.extract_skills(description)
    if experience_years is None:
        experience_years = ai_processor.extract_experience(description)

    db_job = Job(
        title=title,
        description=description,
        employer_id=employer_id,
        job_type=job_type,
        is_urgent=is_urgent,
        latitude=latitude,
        longitude=longitude,
        required_skills=required_skills,
        experience_years=experience_years
    )
    db.add(db_job)
    await db.commit()
    await db.refresh(db_job)
    return db_job

async def get_jobs_nearby(
    db: AsyncSession, 
    *, 
    latitude: float, 
    longitude: float, 
    radius_km: float = 3.0,
    skip: int = 0,
    limit: int = 20
) -> List[Job]:
    # Simple bounding box for DB-agnostic nearby search
    # 1 degree lat ~ 111km
    # 1 degree lon ~ 111km * cos(lat)
    lat_delta = radius_km / 111.0
    lon_delta = radius_km / (111.0 * math.cos(math.radians(latitude)))
    
    query = select(Job).where(
        Job.is_active == True,
        and_(
            Job.latitude >= latitude - lat_delta,
            Job.latitude <= latitude + lat_delta,
            Job.longitude >= longitude - lon_delta,
            Job.longitude <= longitude + lon_delta
        )
    ).order_by(
        Job.is_urgent.desc(),
        Job.created_at.desc()
    ).offset(skip).limit(limit)
    
    result = await db.execute(query)
    return result.scalars().all()

async def get_jobs_by_employer(
    db: AsyncSession,
    *,
    employer_id: int,
    skip: int = 0,
    limit: int = 20
) -> List[Job]:
    result = await db.execute(
        select(Job).where(Job.employer_id == employer_id).offset(skip).limit(limit)
    )
    return result.scalars().all()
