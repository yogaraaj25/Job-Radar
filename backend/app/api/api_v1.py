from fastapi import APIRouter
from app.api import auth, users, jobs, applications, websocket, admin, profile

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(jobs.router, prefix="/jobs", tags=["jobs"])
api_router.include_router(applications.router, prefix="/applications", tags=["applications"])
api_router.include_router(websocket.router, tags=["websocket"])
api_router.include_router(admin.router, prefix="/admin", tags=["admin"])
api_router.include_router(profile.router, prefix="/profile", tags=["profile"])
