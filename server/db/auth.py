import asyncpg
from asyncpg import Connection
from datetime import datetime
from fastapi import HTTPException
from typing import Optional
from models import User


async def insert_user(
    conn: Connection, username: str, password_hash, email: Optional[str]
) -> User:
    query = """
    INSERT INTO users (username, password_hash, email)
    VALUES ($1, $2, $3)
    RETURNING id, username, email, created_at
    """
    try:
        user_row = await conn.fetchrow(query, username, password_hash, email)
    except asyncpg.UniqueViolationError:
        raise HTTPException(
            status_code=400,
            detail="Username or email already used",
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )
    if user_row is None:
        print("Failed to create user")
        raise HTTPException(
            status_code=500,
            detail="Failed to create user",
        )
    return User.model_validate(dict(user_row))


async def get_user_password_hash(
    conn: Connection, username: str
) -> tuple[int, str] | None:
    query = """
    SELECT id, password_hash FROM users WHERE username = $1
    """
    row = await conn.fetchrow(query, username)
    if row is None:
        return None
    return (row['id'], row['password_hash'])


async def create_auth_session(
    conn: Connection, user_id: int, token_hash: str, expires_at: datetime
) -> None:
    query = """
    INSERT INTO auth_sessions (user_id, session_token_hash, expires_at)
    VALUES ($1, $2, $3)
    """
    await conn.execute(query, user_id, token_hash, expires_at)


async def delete_auth_session(conn: Connection, token_hash: str) -> None:
    query = """
    DELETE FROM auth_sessions WHERE session_token_hash = $1
    """
    await conn.execute(query, token_hash)


async def get_user_from_auth_session(
    conn: Connection, token_hash: str
) -> Optional[User]:
    query = """
    SELECT
        u.id,
        u.username,
        u.email,
        u.created_at
    FROM auth_sessions s
    JOIN users u ON u.id = s.user_id
    WHERE s.session_token_hash = $1 AND s.expires_at > NOW()
    """
    row = await conn.fetchrow(query, token_hash)
    if row is None:
        return None
    return User(
        id=row["id"],
        username=row["username"],
        email=row["email"],
        createdAt=row["created_at"],
    )


async def get_auth_session_id(
    conn: Connection, token_hash: str
) -> Optional[int]:
    query = """
    SELECT s.id AS session_id
    FROM auth_sessions s
    WHERE s.session_token_hash = $1 AND s.expires_at > NOW()
    """
    auth_session_id = await conn.fetchval(query, token_hash)
    return auth_session_id
