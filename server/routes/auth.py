import secrets
from argon2 import PasswordHasher
from argon2.exceptions import VerifyMismatchError
from asyncpg import Pool
from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, HTTPException, Request, Response
from pydantic import BaseModel
from typing import Optional
from db.auth import (
    create_auth_session,
    delete_auth_session,
    get_user_from_auth_session,
    get_user_password_hash,
    insert_user,
)
from models import User
from utils.hashing import hash_sha256

router = APIRouter()
ph = PasswordHasher()


class UserCreate(BaseModel):
    username: str
    password: str
    email: Optional[str] = None


@router.post("/register")
async def register_user(user: UserCreate, request: Request) -> User:
    pool: Pool = request.app.state.db_pool
    password_hash = ph.hash(user.password)
    async with pool.acquire() as conn:
        new_user = await insert_user(
            conn, user.username, password_hash, user.email
        )
    return new_user


class LoginRequest(BaseModel):
    username: str
    password: str


@router.post("/login")
async def login(login_req: LoginRequest, request: Request, response: Response):
    try:
        async with request.app.state.db_pool.acquire() as conn:
            # Get user credentials
            user_info = await get_user_password_hash(conn, login_req.username)
            if not user_info:
                raise HTTPException(status_code=401,
                                    detail="Invalid credentials")

            user_id, password_hash = user_info

            # Verify password
            try:
                ph.verify(password_hash, login_req.password)
            except VerifyMismatchError:
                raise HTTPException(status_code=401,
                                    detail="Invalid credentials")

            # Generate session token
            session_token = secrets.token_urlsafe(32)
            token_hash = hash_sha256(session_token)

            # Store session
            session_length = timedelta(days=30)
            expires_at = datetime.now(timezone.utc) + session_length
            await create_auth_session(conn, user_id, token_hash, expires_at)

            # Set cookie
            response.set_cookie(
                key="session_token",
                value=session_token,
                httponly=True,
                secure=False,  # Allow HTTP for DEVELOPMENT ONLY
                samesite="lax",  # Preserved when navigating from external domain
                max_age=int(session_length.total_seconds()),
                domain="localhost",  # Allow cookie sharing for dev
                path="/",  # Cookies accessible from any path
            )
            
            return {
                "message": "Logged in successfully",
                "userId": user_id,
            }
    except HTTPException:
        raise
    except Exception as err:
        print("[ERROR]", err)
        raise HTTPException(status_code=500, detail=str(err))


@router.post("/logout")
async def logout(request: Request, response: Response):
    session_token = request.cookies.get("session_token")
    if not session_token:
        raise HTTPException(status_code=401, detail="No session token")
    token_hash = hash_sha256(session_token)
    try:
        async with request.app.state.db_pool.acquire() as conn:
            await delete_auth_session(conn, token_hash)

        # Clear the cookie
        response.delete_cookie(
            key="session_token",
            domain="localhost",  # Ensure domain matches your cookie settings
            path="/",
        )
        return {"message": "Logged out successfully"}
    except Exception as err:
        print("[ERROR]", err)
        raise HTTPException(status_code=500, detail=str(err))


@router.get("/verify-session")
async def verify_session(request: Request) -> User:
    session_token = request.cookies.get("session_token")
    if not session_token:
        raise HTTPException(status_code=401, detail="No session token")
    token_hash = hash_sha256(session_token)
    try:
        async with request.app.state.db_pool.acquire() as conn:
            # Fetch and verify the session from the database
            user = await get_user_from_auth_session(conn, token_hash)
            if not user:
                raise HTTPException(status_code=401,
                                    detail="Invalid or expired session")
            return user
    except Exception as err:
        print("[ERROR]", err)
        raise HTTPException(status_code=500, detail=str(err))
