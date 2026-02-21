from typing import Optional, List
from pydantic import BaseModel, Field
from app.models.job import JobType
from datetime import datetime

class JobBase(BaseModel):
    title: str
    description: str
    job_type: JobType = JobType.LOCAL
    is_urgent: bool = False

class JobCreate(JobBase):
    latitude: float = Field(..., ge=-90, le=90)
    longitude: float = Field(..., ge=-180, le=180)
    
    # AI Fields (Optional during creation, will be auto-filled if not provided)
    required_skills: Optional[List[str]] = None
    experience_years: Optional[int] = None

class JobUpdate(JobBase):
    title: Optional[str] = None
    description: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None

class Job(JobBase):
    id: int
    employer_id: int
    is_active: bool
    latitude: float
    longitude: float
    required_skills: Optional[List[str]] = None
    experience_years: Optional[int] = None
    applicants_count: Optional[int] = 0

    class Config:
        from_attributes = True

class JobNearbyRequest(BaseModel):
    latitude: float
    longitude: float
    radius_meters: float = 10000
