from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.application import Application, ApplicationStatus
from app.models.user import User
from app.models.profile import JobSeekerProfile

async def create_application(
    db: AsyncSession, 
    *, 
    job_id: int, 
    applicant_id: int,
    match_score: Optional[float] = None
) -> Application:
    db_application = Application(
        job_id=job_id,
        applicant_id=applicant_id,
        status=ApplicationStatus.PENDING,
        match_score=match_score
    )
    db.add(db_application)
    await db.commit()
    await db.refresh(db_application)
    return db_application

async def get_applications_by_user(
    db: AsyncSession, 
    applicant_id: int
) -> List[Application]:
    result = await db.execute(
        select(Application).where(Application.applicant_id == applicant_id)
    )
    return result.scalars().all()

async def get_applications_by_job(
    db: AsyncSession, 
    job_id: int
) -> List[Application]:
    query = select(
        Application, 
        User.full_name, 
        User.email,
        JobSeekerProfile.skills,
        JobSeekerProfile.resume_text,
        JobSeekerProfile.experience_level
    ).join(
        User, Application.applicant_id == User.id
    ).outerjoin(
        JobSeekerProfile, User.id == JobSeekerProfile.user_id
    ).where(Application.job_id == job_id)
    
    result = await db.execute(query)
    apps = []
    for row in result.all():
        app, name, email, skills, resume, exp_level = row
        app.applicant_name = name
        app.applicant_email = email
        app.applicant_skills = skills
        app.applicant_resume = resume
        app.applicant_experience_level = exp_level
        apps.append(app)
    return apps

async def update_application_status(
    db: AsyncSession, 
    application_id: int, 
    status: ApplicationStatus
) -> Optional[Application]:
    result = await db.execute(
        select(Application).where(Application.id == application_id)
    )
    db_application = result.scalars().first()
    if db_application:
        db_application.status = status
        await db.commit()
        await db.refresh(db_application)
    return db_application
