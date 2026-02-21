from sqlalchemy import Column, Integer, String, Boolean, Enum, ForeignKey, DateTime, Text, Float, JSON
from sqlalchemy.sql import func
from app.core.database import Base
import enum

class JobType(str, enum.Enum):
    LOCAL = "local"
    PROFESSIONAL = "professional"

class Job(Base):
    __tablename__ = "jobs"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), index=True, nullable=False)
    description = Column(Text, nullable=False)
    employer_id = Column(Integer, ForeignKey("users.id"))
    job_type = Column(Enum(JobType), default=JobType.LOCAL)
    is_urgent = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Standard Lat/Lon for maximum compatibility (SQLite/Postgres)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    
    # AI Extracted Data
    required_skills = Column(JSON, nullable=True)  # List of strings
    experience_years = Column(Integer, nullable=True)

    # Relationships can be added here later
