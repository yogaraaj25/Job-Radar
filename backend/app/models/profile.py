import enum
from sqlalchemy import Column, Integer, String, Text, ForeignKey, JSON, Enum, Float
from sqlalchemy.orm import relationship
from app.core.database import Base

class ExperienceLevel(str, enum.Enum):
    FRESHER = "Fresher"
    EXPERIENCE_1_3 = "1-3"
    EXPERIENCE_3_5 = "3-5"
    EXPERIENCE_5_PLUS = "5+"

class PreferredJobType(str, enum.Enum):
    LOCAL = "Local"
    IT = "IT"
    REMOTE = "Remote"

class BusinessType(str, enum.Enum):
    SHOP = "Shop"
    STARTUP = "Startup"
    IT_COMPANY = "IT Company"
    OTHER = "Other"

class JobSeekerProfile(Base):
    __tablename__ = "job_seeker_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    bio = Column(Text, nullable=True)
    skills = Column(JSON, nullable=True)  # List of normalized skill names
    experience_level = Column(Enum(ExperienceLevel), nullable=True)
    location = Column(String(255), nullable=True)
    resume_text = Column(Text, nullable=True)
    preferred_job_type = Column(Enum(PreferredJobType), nullable=True)
    
    user = relationship("User", back_populates="seeker_profile")

class EmployerProfile(Base):
    __tablename__ = "employer_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    company_name = Column(String(255), index=True, nullable=False)
    business_type = Column(Enum(BusinessType), nullable=True)
    location = Column(String(255), nullable=True)
    contact_number = Column(String(50), nullable=True)
    company_description = Column(Text, nullable=True)
    website = Column(String(500), nullable=True)
    
    # Base location for discovery
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    
    user = relationship("User", back_populates="employer_profile")
