from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.api import deps
from app.models.user import User, UserRole
from app.models.job import Job
from app.schemas.job import Job as JobSchema

router = APIRouter()

def check_admin(current_user: User = Depends(deps.get_current_user)):
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="The user doesn't have enough privileges"
        )
    return current_user

@router.get("/jobs", response_model=List[JobSchema])
async def read_all_jobs(
    db: AsyncSession = Depends(deps.get_db),
    admin_user: User = Depends(check_admin),
    skip: int = 0,
    limit: int = 100,
) -> Any:
    """
    Retrieve all jobs (Admin only).
    """
    result = await db.execute(select(Job).offset(skip).limit(limit))
    return result.scalars().all()

@router.patch("/jobs/{id}/approve", response_model=JobSchema)
async def approve_job(
    id: int,
    db: AsyncSession = Depends(deps.get_db),
    admin_user: User = Depends(check_admin),
) -> Any:
    """
    Approve a job posting.
    """
    result = await db.execute(select(Job).where(Job.id == id))
    job = result.scalars().first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    job.is_active = True
    await db.commit()
    await db.refresh(job)
    return job

@router.patch("/jobs/{id}/block", response_model=JobSchema)
async def block_job(
    id: int,
    db: AsyncSession = Depends(deps.get_db),
    admin_user: User = Depends(check_admin),
) -> Any:
    """
    Block a job posting.
    """
    result = await db.execute(select(Job).where(Job.id == id))
    job = result.scalars().first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    job.is_active = False
    await db.commit()
    await db.refresh(job)
    return job
