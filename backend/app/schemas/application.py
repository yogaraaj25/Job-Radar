from typing import Optional, List
from pydantic import BaseModel
from app.models.application import ApplicationStatus
from datetime import datetime

class ApplicationBase(BaseModel):
    job_id: int
    status: ApplicationStatus = ApplicationStatus.PENDING

class ApplicationCreate(ApplicationBase):
    pass

class ApplicationUpdate(BaseModel):
    status: ApplicationStatus

class Application(ApplicationBase):
    id: int
    applicant_id: int
    applied_at: datetime
    match_score: Optional[float] = None
    
    # Optional fields for employer view
    applicant_name: Optional[str] = None
    applicant_email: Optional[str] = None
    applicant_skills: Optional[List[str]] = None
    applicant_resume: Optional[str] = None
    applicant_experience_level: Optional[str] = None

    class Config:
        from_attributes = True
