from fastapi import APIRouter, Depends, HTTPException, Body, status
import httpx
from typing import Dict, Any
import logging
import time
from fastapi.security import HTTPBearer
from datetime import datetime
from supabase import Client
from config import SUPABASE_SERVICE_KEY, SUPABASE_URL
from lib import get_supabase_client
from service.auth_service import AuthResponse, User, UserExists, UserExistsResponse, UserPasswordReset, UserPasswordUpdate, UserProfile, UserSignIn, UserSignUp, get_current_user


logger = logging.getLogger("auth_routes")
supabase: Client = get_supabase_client()
router = APIRouter()
security = HTTPBearer()


@router.post("/signup", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
async def sign_up(user_data: UserSignUp):
    logger.info(f"Processing sign-up request for email: {user_data.email}")
    start_time = time.time()

    try:
        user_metadata = {}
        if user_data.full_name:
            user_metadata["full_name"] = user_data.full_name

        signup_response = supabase.auth.sign_up({
            "email": user_data.email,
            "password": user_data.password,
            "options": {
                "data": user_metadata
            }
        })
        logger.info(f"Supabase signup response: {signup_response}")
        if not signup_response.user:
            logger.error(f"Failed to create user: {signup_response}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to create user account"
            )

        user = signup_response.user

        if not signup_response.session:
            return {
                "access_token": None,
                "refresh_token": None,
                "user": {
                    "id": user.id,
                    "email": user.email,
                    "full_name": user_data.full_name,
                    "created_at": datetime.now().isoformat(),
                }
            }

     
        return {
            "access_token": signup_response.session.access_token,
            "refresh_token": signup_response.session.refresh_token,
            "user": {
                "id": user.id,
                "email": user.email,
                "full_name": user_data.full_name,
                "created_at": datetime.now().isoformat(),
            }
        }

    except Exception as e:
        logger.error(f"Error during user signup: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.post("/signin", response_model=AuthResponse)
async def sign_in(credentials: UserSignIn):
    """
    Authenticate a user and return JWT tokens.
    """
    logger.info(f"Processing sign-in request for email: {credentials.email}")
    start_time = time.time()
    
    try:
        signin_response = supabase.auth.sign_in_with_password({
            "email": credentials.email,
            "password": credentials.password
        })
        
        if not signin_response.user:
            logger.warning(f"Failed login attempt for: {credentials.email}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password"
            )
            
        user = signin_response.user
        session = signin_response.session
        
            
        user_profile = {
            "id": user.id,
            "email": user.email,
            "full_name": user.user_metadata.get("full_name") if hasattr(user, "user_metadata") else None,
            "created_at": user.created_at if hasattr(user, "created_at") else datetime.now().isoformat()
        }
        
        
        elapsed_time = time.time() - start_time
        logger.info(f"User login successful in {elapsed_time:.2f} seconds for: {credentials.email}")
        
       
        return {
            "access_token": session.access_token,
            "refresh_token": session.refresh_token,
            "expires_in": 3600,  
            "user": user_profile
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error during user signin: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Authentication failed"
        )

@router.post("/signout", status_code=status.HTTP_200_OK)
async def sign_out():
    """
    Sign out the current user.
    """
    logger.info(f"Processing sign-out request for user")
    
    try:

        supabase.auth.sign_out()
        
        logger.info(f"User signed out successfully")
        return {"message": "Successfully signed out"}
        
    except Exception as e:
        logger.error(f"Error during user signout: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to sign out"
        )

@router.get("/session", response_model=Dict[str, Any])
async def check_session(current_user: User = Depends(get_current_user)):
    """
    Check if the current session is valid and return user information.
    """
    logger.info(f"Checking session for user: {current_user.email}")
    
    try:

        try:
            profile_response = supabase.table("user_profiles").select("*").eq("id", current_user.id).execute()
            profile_data = profile_response.data[0] if profile_response.data else {}
        except Exception:
            profile_data = {}
        

        return {
            "authenticated": True,
            "user": {
                "id": current_user.id,
                "email": current_user.email,
                "full_name": current_user.full_name,
                **profile_data
            }
        }
        
    except Exception as e:
        logger.error(f"Error checking session: {str(e)}")
        return {
            "authenticated": False,
            "message": "Session invalid or expired"
        }

@router.post("/password-reset", status_code=status.HTTP_200_OK)
async def password_reset_request(reset_data: UserPasswordReset):
    """
    Request a password reset email.
    """
    logger.info(f"Processing password reset request for: {reset_data.email}")
    
    try:
      
        supabase.auth.reset_password_email(reset_data.email)
        
        logger.info(f"Password reset email sent to: {reset_data.email}")
        return {"message": "Password reset email sent"}
        
    except Exception as e:
        logger.error(f"Error sending password reset: {str(e)}")
   
        return {"message": "If email exists, a password reset link will be sent"}

@router.post("/password-update", status_code=status.HTTP_200_OK)
async def update_password(
    password_data: UserPasswordUpdate,
    current_user: User = Depends(get_current_user)
):
    """
    Update the user's password.
    """
    logger.info(f"Processing password update for user: {current_user.email}")
    
    try:

        supabase.auth.update_user({
            "password": password_data.new_password
        })
        
        logger.info(f"Password updated successfully for: {current_user.email}")
        return {"message": "Password updated successfully"}
        
    except Exception as e:
        logger.error(f"Error updating password: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update password"
        )

@router.post("/user-exists", response_model=UserExistsResponse)
async def check_user_exists(user_data: UserExists):
    """
    Check if a user with the given email already exists.
    """
    logger.info(f"Checking if user exists: {user_data.email}")
    
    try:
      
        response = supabase.table("user_profiles").select("id").eq("email", user_data.email).execute()
        
        if response.data and len(response.data) > 0:
            logger.info(f"User exists check: {user_data.email} - Found")
            return {
                "exists": True,
                "message": "User with this email already exists"
            }
        else:
            logger.info(f"User exists check: {user_data.email} - Not found")
            return {
                "exists": False,
                "message": "Email is available"
            }
            
    except Exception as e:
        logger.error(f"Error checking if user exists: {str(e)}")
 
        return {
            "exists": False,
            "message": "Unable to determine if user exists"
        }

@router.post("/refresh-token", response_model=AuthResponse)
async def refresh_access_token(refresh_token: str = Body(..., embed=True)):
    """
    Refresh the access token using a refresh token.
    """
    logger.info("Processing token refresh request")
    
    try:
        refresh_response = supabase.auth.refresh_session(refresh_token)
        
        if not refresh_response.user:
            logger.warning("Failed to refresh token: Invalid refresh token")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid refresh token"
            )
            
        user = refresh_response.user
        session = refresh_response.session
        user_profile = {
            "id": user.id,
            "email": user.email,
            "full_name": user.user_metadata.get("full_name") if hasattr(user, "user_metadata") else None,
            "created_at": user.created_at if hasattr(user, "created_at") else datetime.now().isoformat()
        }
        
        logger.info(f"Token refreshed successfully for user: {user.email}")
        
        print(f"User profile: {user_profile}")
        return {
            "access_token": session.access_token,
            "refresh_token": session.refresh_token,
            "expires_in": 3600,
            "user": user_profile
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error refreshing token: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to refresh token"
        )

@router.get("/profile", response_model=UserProfile)
async def get_user_profile(current_user: User = Depends(get_current_user)):
    """
    Get the current user's profile.
    """
    logger.info(f"Fetching profile for user: {current_user.email}")
    
    try:
   
        profile_response = supabase.table("user_profiles").select("*").eq("id", current_user.id).execute()
        
        if not profile_response.data:
            logger.info(f"Creating missing profile for user: {current_user.email}")
            supabase.table("user_profiles").insert({
                "id": current_user.id,
                "email": current_user.email,
                "full_name": current_user.full_name,
                "created_at": datetime.now().isoformat()
            }).execute()
            
            profile_data = {
                "id": current_user.id,
                "email": current_user.email,
                "full_name": current_user.full_name,
                "created_at": datetime.now()
            }
        else:
            profile_data = profile_response.data[0]
            
        return profile_data
        
    except Exception as e:
        logger.error(f"Error fetching user profile: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve user profile"
        )

@router.delete("/account", status_code=200)
async def delete_user_account(current_user: User = Depends(get_current_user)):
    """Deletes a user from Supabase Auth and all associated data."""
    headers = {
        "apikey": SUPABASE_SERVICE_KEY,
        "Authorization": f"Bearer {SUPABASE_SERVICE_KEY}"
    }

    async with httpx.AsyncClient() as client:
        response = await client.delete(
            f"{SUPABASE_URL}/auth/v1/admin/users/{current_user.id}",
            headers=headers
        )

        if response.status_code != 200:
            print(f"Supabase delete user response: {response.json()}")
            raise HTTPException(status_code=500, detail="Failed to delete user from Supabase Auth")

    return