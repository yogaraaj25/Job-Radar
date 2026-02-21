from typing import Optional
from pydantic import BaseModel, EmailStr
from app.models.user import UserRole
from app.schemas.profile import JobSeekerProfileCreate, EmployerProfileCreate, JobSeekerProfile, EmployerProfile

class UserBase(BaseModel):
    email: Optional[EmailStr] = None
    is_active: Optional[bool] = True
    full_name: Optional[str] = None
    role: Optional[UserRole] = UserRole.JOB_SEEKER

class UserCreate(UserBase):
    email: EmailStr
    password: str
    # Profile data during signup
    job_seeker_profile: Optional[JobSeekerProfileCreate] = None
    employer_profile: Optional[EmployerProfileCreate] = None

class UserUpdate(UserBase):
    password: Optional[str] = None

class User(UserBase):
    id: int
    seeker_profile: Optional[JobSeekerProfile] = None
    employer_profile: Optional[EmployerProfile] = None

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str
    user_role: str

class TokenRefresh(BaseModel):
    refresh_token: str

class TokenPayload(BaseModel):
    sub: Optional[int] = None
