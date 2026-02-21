from typing import Optional, List
from pydantic import BaseModel
from app.models.profile import ExperienceLevel, PreferredJobType, BusinessType

# --- Job Seeker Profile Schemas ---
class JobSeekerProfileBase(BaseModel):
    bio: Optional[str] = None
    skills: Optional[List[str]] = None
    experience_level: Optional[ExperienceLevel] = None
    location: Optional[str] = None
    resume_text: Optional[str] = None
    preferred_job_type: Optional[PreferredJobType] = None

class JobSeekerProfileCreate(JobSeekerProfileBase):
    pass

class JobSeekerProfileUpdate(JobSeekerProfileBase):
    pass

class JobSeekerProfile(JobSeekerProfileBase):
    id: int
    user_id: int

    class Config:
        from_attributes = True

# --- Employer Profile Schemas ---
class EmployerProfileBase(BaseModel):
    company_name: str
    business_type: Optional[BusinessType] = None
    location: Optional[str] = None
    contact_number: Optional[str] = None
    company_description: Optional[str] = None
    website: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None

class EmployerProfileCreate(EmployerProfileBase):
    pass

class EmployerProfileUpdate(EmployerProfileBase):
    company_name: Optional[str] = None

class EmployerProfile(EmployerProfileBase):
    id: int
    user_id: int

    class Config:
        from_attributes = True

# --- Unified Profile Update ---
class ProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    # Nested updates
    job_seeker: Optional[JobSeekerProfileUpdate] = None
    employer: Optional[EmployerProfileUpdate] = None
