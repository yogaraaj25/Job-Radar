from typing import Any, List
from itertools import islice

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from app.api import deps
from app.crud import job as crud_job
from app.schemas.job import Job as JobSchema, JobCreate, JobNearbyRequest
from app.models.user import User as UserModel, UserRole
from app.models.job import Job, JobType
from app.models.profile import JobSeekerProfile, EmployerProfile
from app.core.ai_processor import ai_processor
from app.models.application import Application
from app.api.websocket import manager

router = APIRouter()


@router.post("/", response_model=JobSchema)
async def create_job(
    *,
    db: AsyncSession = Depends(deps.get_db),
    job_in: JobCreate,
    current_user: UserModel = Depends(deps.get_current_user),
) -> Any:
    """
    Create new job. Only for Employers and Admins.
    """
    if current_user.role not in [UserRole.EMPLOYER, UserRole.ADMIN]:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    job = await crud_job.create_job(
        db, 
        title=job_in.title,
        description=job_in.description,
        employer_id=current_user.id,
        job_type=job_in.job_type,
        latitude=job_in.latitude,
        longitude=job_in.longitude,
        is_urgent=job_in.is_urgent,
        required_skills=job_in.required_skills,
        experience_years=job_in.experience_years
    )
    
    # Notify nearby users via WebSocket
    await manager.broadcast({
        "type": "NEW_JOB",
        "job": {
            "id": job.id,
            "title": job.title,
            "latitude": float(job_in.latitude),
            "longitude": float(job_in.longitude),
            "is_urgent": bool(job.is_urgent)
        }
    })
    
    return job


@router.get("/nearby", response_model=List[JobSchema])
async def read_jobs_nearby(
    lat: float,
    lon: float,
    radius_km: float = 3.0,
    skip: int = 0,
    limit: int = 20,
    db: AsyncSession = Depends(deps.get_db),
) -> Any:
    """
    Retrieve jobs within a certain radius.
    Sorted by: Urgent first, Nearest distance, Newest post.
    """
    return await crud_job.get_jobs_nearby(
        db, latitude=lat, longitude=lon, radius_km=radius_km, skip=skip, limit=limit
    )

@router.get("/recommend", response_model=List[JobSchema])
async def recommend_jobs(
    db: AsyncSession = Depends(deps.get_db),
    current_user: UserModel = Depends(deps.get_current_user),
    limit: int = 10,
) -> Any:
    """
    Recommend jobs based on user profile skills using AI matching (IT jobs only).
    """
    # 1. Fetch user profile
    result = await db.execute(
        select(JobSeekerProfile).where(JobSeekerProfile.user_id == current_user.id)
    )
    profile = result.scalars().first()
    if not profile or not profile.skills:
        # Fallback to general nearby if no skills
        return await crud_job.get_jobs_nearby(db, latitude=0, longitude=0, radius_km=1000)

    # 2. Fetch all active IT jobs 
    # (In a large scale app, this would be pre-filtered or use vector search)
    jobs_result = await db.execute(
        select(Job).where(Job.is_active == True, Job.job_type == JobType.PROFESSIONAL)
    )
    all_it_jobs = jobs_result.scalars().all()

@router.post("/analyze")
async def analyze_job_description(
    *,
    data: dict,
    current_user: UserModel = Depends(deps.get_current_user),
) -> Any:
    """
    Analyze job description with AI to extract skills and experience for preview.
    """
    description = data.get("description", "")
    skills = ai_processor.extract_skills(description)
    experience = ai_processor.extract_experience(description)
    return {"skills": skills, "experience": experience}

@router.get("/recommend", response_model=List[JobSchema])
async def recommend_jobs(
    db: AsyncSession = Depends(deps.get_db),
    current_user: UserModel = Depends(deps.get_current_user),
    limit: int = 10,
) -> Any:
    """
    Recommend jobs based on user profile skills using AI matching (IT jobs only).
    """
    # 1. Fetch user profile
    result = await db.execute(
        select(JobSeekerProfile).where(JobSeekerProfile.user_id == current_user.id)
    )
    profile = result.scalars().first()
    if not profile or not profile.skills:
        # Fallback to general nearby if no skills
        return await crud_job.get_jobs_nearby(db, latitude=0, longitude=0, radius_km=1000)

    # 2. Fetch all active IT jobs 
    # (In a large scale app, this would be pre-filtered or use vector search)
    jobs_result = await db.execute(
        select(Job).where(Job.is_active == True, Job.job_type == JobType.PROFESSIONAL)
    )
    all_it_jobs = jobs_result.scalars().all()

    # 3. Match using AI service
    scored_jobs: List[tuple] = []
    for job in all_it_jobs:
        score = ai_processor.calculate_match_score(profile.resume_text or "", job.description)
        scored_jobs.append((job, score))

    # 4. Sort by score and return top results
    scored_jobs.sort(key=lambda x: x[1], reverse=True)
    return [j[0] for j in islice(scored_jobs, limit)]
@router.get("/me", response_model=List[JobSchema])
async def read_my_jobs(
    db: AsyncSession = Depends(deps.get_db),
    current_user: UserModel = Depends(deps.get_current_user),
    skip: int = 0,
    limit: int = 100
) -> Any:
    """
    Retrieve jobs created by the current user (Employer).
    """
    if current_user.role not in [UserRole.EMPLOYER, UserRole.ADMIN]:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    jobs = await crud_job.get_jobs_by_employer(
        db, employer_id=current_user.id, skip=skip, limit=limit
    )
    
    # Populate counts
    for job in jobs:
        count_res = await db.execute(
            select(func.count(Application.id)).where(Application.job_id == job.id)
        )
        job.applicants_count = count_res.scalar() or 0
        
    return jobs
