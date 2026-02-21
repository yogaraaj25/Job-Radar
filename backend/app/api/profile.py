from typing import Any
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.api import deps
from app.models.user import User as UserModel, UserRole
from app.models.profile import JobSeekerProfile, EmployerProfile
from app.schemas.user import User
from app.schemas.profile import ProfileUpdate

router = APIRouter()

@router.get("/", response_model=User)
async def get_profile(
    current_user: UserModel = Depends(deps.get_current_user),
    db: AsyncSession = Depends(deps.get_db)
) -> Any:
    """
    Get current user profile with role-specific data.
    """
    # Reload user with profiles
    result = await db.execute(
        select(UserModel)
        .where(UserModel.id == current_user.id)
        .options(selectinload(UserModel.seeker_profile), selectinload(UserModel.employer_profile))
    )
    user = result.scalars().first()
    return user

@router.patch("/update", response_model=User)
async def update_profile(
    *,
    db: AsyncSession = Depends(deps.get_db),
    profile_in: ProfileUpdate,
    current_user: UserModel = Depends(deps.get_current_user)
) -> Any:
    """
    Update user profile and role-specific data.
    """
    # Update common fields
    if profile_in.full_name is not None:
        current_user.full_name = profile_in.full_name
    
    # Update role-specific fields
    if current_user.role == UserRole.JOB_SEEKER and profile_in.job_seeker:
        result = await db.execute(select(JobSeekerProfile).where(JobSeekerProfile.user_id == current_user.id))
        profile = result.scalars().first()
        if profile:
            update_data = profile_in.job_seeker.model_dump(exclude_unset=True)
            for field, value in update_data.items():
                setattr(profile, field, value)
                
    elif current_user.role == UserRole.EMPLOYER and profile_in.employer:
        result = await db.execute(select(EmployerProfile).where(EmployerProfile.user_id == current_user.id))
        profile = result.scalars().first()
        if profile:
            update_data = profile_in.employer.model_dump(exclude_unset=True)
            for field, value in update_data.items():
                setattr(profile, field, value)

    db.add(current_user)
    await db.commit()
    
    # Return updated user with profiles
    result = await db.execute(
        select(UserModel)
        .where(UserModel.id == current_user.id)
        .options(selectinload(UserModel.seeker_profile), selectinload(UserModel.employer_profile))
    )
    return result.scalars().first()
