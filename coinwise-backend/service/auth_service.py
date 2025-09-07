
import logging
from fastapi import APIRouter, Depends, HTTPException,status
from fastapi import security
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from pydantic import BaseModel, EmailStr, Field, validator
from typing import Optional
import re
from uuid import UUID
from datetime import datetime
from supabase import Client
from config import SUPABASE_SERVICE_KEY, SUPABASE_URL
from lib import get_supabase_client


logger = logging.getLogger("auth_routes")
supabase: Client = get_supabase_client()
router = APIRouter()
security = HTTPBearer()
class UserSignUp(BaseModel):
    email: EmailStr = Field(..., description="User email address")
    password: str = Field(..., description="User password")
    full_name: Optional[str] = Field(None, description="User full name")
    
    @validator('password')
    def password_strength(cls, v):
        """Validate password strength"""
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters long")
        if not re.search(r'[A-Z]', v):
            raise ValueError("Password must contain at least one uppercase letter")
        if not re.search(r'[a-z]', v):
            raise ValueError("Password must contain at least one lowercase letter")
        if not re.search(r'[0-9]', v):
            raise ValueError("Password must contain at least one number")
        return v

class UserSignIn(BaseModel):
    email: EmailStr = Field(..., description="User email address")
    password: str = Field(..., description="User password")

class UserProfile(BaseModel):
    id: UUID
    email: EmailStr
    full_name: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

class AuthResponse(BaseModel):
    access_token: Optional[str] = None
    token_type: str = "bearer"
    expires_in: Optional[int] = None
    refresh_token: Optional[str] = None
    user: UserProfile

class UserPasswordReset(BaseModel):
    email: EmailStr = Field(..., description="User email address")

class UserPasswordUpdate(BaseModel):
    current_password: str = Field(..., description="Current password")
    new_password: str = Field(..., description="New password")
    
    @validator('new_password')
    def password_strength(cls, v):
        """Validate password strength"""
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters long")
        if not re.search(r'[A-Z]', v):
            raise ValueError("Password must contain at least one uppercase letter")
        if not re.search(r'[a-z]', v):
            raise ValueError("Password must contain at least one lowercase letter")
        if not re.search(r'[0-9]', v):
            raise ValueError("Password must contain at least one number")
        return v

class UserExists(BaseModel):
    email: EmailStr = Field(..., description="User email address")

class UserExistsResponse(BaseModel):
    exists: bool
    message: str

class User:
    def __init__(self, id: str, email: str,full_name: Optional[str] = None):
        self.id = id
        self.email = email
        self.full_name = full_name
        
async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
    
        token = credentials.credentials
        user_response = supabase.auth.get_user(token)
        
        if not user_response or not user_response.user:
            logger.error("Invalid authentication credentials")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )
        

        user_data = user_response.user
        return User(id=user_data.id, email=user_data.email, full_name=user_data.user_metadata.get("full_name"))
        
    except Exception as e:
        logger.error(f"Authentication error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
