from datetime import timedelta
from typing import Any, Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from jose import jwt
from pydantic import ValidationError

from app.api import deps
from app.core import security
from app.core.config import settings
from app.crud import user as crud_user
from app.schemas.user import Token, TokenRefresh, User, UserCreate
from app.models.user import User as UserModel, UserRole

router = APIRouter()


@router.post("/login", response_model=Token)
async def login_access_token(
    db: AsyncSession = Depends(deps.get_db),
    form_data: OAuth2PasswordRequestForm = Depends()
) -> Any:
    """
    OAuth2 compatible token login, get an access token for future requests
    """
    user = await crud_user.authenticate_user(
        db, email=form_data.username, password=form_data.password
    )
    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect email or password"
        )
    elif not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user"
        )
    
    return {
        "access_token": security.create_access_token(user.id),
        "refresh_token": security.create_refresh_token(user.id),
        "token_type": "bearer",
        "user_role": user.role,
    }


@router.post("/refresh", response_model=Token)
async def refresh_token(
    refresh_in: TokenRefresh,
    db: Annotated[AsyncSession, Depends(deps.get_db)]
) -> Any:
    """
    Refresh token.
    """
    refresh_token = refresh_in.refresh_token
    try:
        payload = jwt.decode(
            refresh_token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
        )
        if payload.get("type") != "refresh":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid token type",
            )
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Could not validate credentials",
            )
    except (jwt.JWTError, ValidationError):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Could not validate credentials",
        )
    
    # Check if user still exists and is active
    result = await db.execute(select(UserModel).where(UserModel.id == int(user_id)))
    user = result.scalars().first()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if not user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
        
    return {
        "access_token": security.create_access_token(user.id),
        "refresh_token": security.create_refresh_token(user.id),
        "token_type": "bearer",
    }


@router.post("/register", response_model=User)
async def register(
    *,
    db: AsyncSession = Depends(deps.get_db),
    user_in: UserCreate
) -> Any:
    """
    Create new user with optional profile data.
    """
    user = await crud_user.get_user_by_email(db, email=user_in.email)
    if user:
        raise HTTPException(
            status_code=400,
            detail="The user with this username already exists in the system.",
        )
    
    # The model_dump call here is safe as UserCreate already validated the input
    # But if we had logic before this that could fail, we'd log it
    try:
        job_seeker_data = user_in.job_seeker_profile.model_dump() if user_in.job_seeker_profile else None
        employer_data = user_in.employer_profile.model_dump() if user_in.employer_profile else None
        
        return await crud_user.create_user(
            db, 
            email=user_in.email, 
            password=user_in.password, 
            full_name=user_in.full_name, 
            role=user_in.role,
            job_seeker_in=job_seeker_data,
            employer_in=employer_data
        )
    except Exception as e:
        import logging
        logging.error(f"Error during registration: {str(e)}")
        raise e

@router.post("/test-token", response_model=User)
async def test_token(current_user: User = Depends(deps.get_current_user)) -> Any:
    """
    Test access token
    """
    return current_user
