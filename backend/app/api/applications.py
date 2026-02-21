from typing import Any, List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api import deps
from app.crud import application as crud_application
from app.schemas.application import Application, ApplicationCreate, ApplicationUpdate
from app.models.user import User as UserModel, UserRole
from app.models.job import Job
from app.models.profile import JobSeekerProfile
from app.core.ai_processor import ai_processor
from sqlalchemy import select

router = APIRouter()


@router.post("/", response_model=Application)
async def create_application(
    *,
    db: AsyncSession = Depends(deps.get_db),
    application_in: ApplicationCreate,
    current_user: UserModel = Depends(deps.get_current_user),
) -> Any:
    """
    Apply for a job.
    """
    # Calculate match score before applying
    job_result = await db.execute(select(Job).where(Job.id == application_in.job_id))
    job = job_result.scalars().first()
    
    profile_result = await db.execute(select(JobSeekerProfile).where(JobSeekerProfile.user_id == current_user.id))
    profile = profile_result.scalars().first()
    
    match_score = 0.0
    if job and profile and profile.resume_text:
        match_score = ai_processor.calculate_match_score(profile.resume_text, job.description)

    return await crud_application.create_application(
        db, 
        job_id=application_in.job_id, 
        applicant_id=current_user.id,
        match_score=match_score
    )


@router.get("/me", response_model=List[Application])
async def read_my_applications(
    db: AsyncSession = Depends(deps.get_db),
    current_user: UserModel = Depends(deps.get_current_user),
) -> Any:
    """
    Retrieve current user's applications.
    """
    return await crud_application.get_applications_by_user(
        db, applicant_id=current_user.id
    )


@router.patch("/{application_id}", response_model=Application)
async def update_application_status(
    *,
    db: AsyncSession = Depends(deps.get_db),
    application_id: int,
    application_in: ApplicationUpdate,
    current_user: UserModel = Depends(deps.get_current_user),
) -> Any:
    """
    Update application status. Only for Employers or Admins.
    """
    if current_user.role not in [UserRole.EMPLOYER, UserRole.ADMIN]:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    application = await crud_application.update_application_status(
        db, application_id=application_id, status=application_in.status
    )
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")
    return application
@router.get("/job/{job_id}", response_model=List[Application])
async def read_job_applications(
    job_id: int,
    db: AsyncSession = Depends(deps.get_db),
    current_user: UserModel = Depends(deps.get_current_user),
) -> Any:
    """
    Retrieve applications for a specific job. Only for the job owner or Admin.
    """
    # Verify ownership
    job_result = await db.execute(select(Job).where(Job.id == job_id))
    job = job_result.scalars().first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    if job.employer_id != current_user.id and current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Not authorized to view these applications")

    return await crud_application.get_applications_by_job(db, job_id=job_id)
