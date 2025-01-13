from typing import Optional
from asyncpg import Connection
from models import Coords, GameSession


async def get_game_session(
    conn: Connection, user_id: int
) -> Optional[GameSession]:
    query = """
    SELECT
        id,
        user_id,
        auth_session_id,
        ST_Y(location::geometry) AS lat,
        ST_X(location::geometry) AS lon,
        created_at
    FROM game_sessions WHERE user_id = $1;
    """
    row = await conn.fetchrow(query, user_id)
    if row is None:
        return None
    return GameSession(
        id=row["id"],
        userId=row["user_id"],
        authSessionId=row["auth_session_id"],
        location=Coords(lat=row["lat"],
                      lon=row["lon"]),
        createdAt=row["created_at"],
    )


async def create_game_session(
    conn: Connection, user_id: int, auth_session_id: int, pos: Coords
) -> None:
    query = """
    INSERT INTO game_sessions (user_id, auth_session_id, location)
    VALUES ($1, $2, ST_SetSRID(ST_MakePoint($3, $4), 4326));
    """
    await conn.execute(query, user_id, auth_session_id, pos.lon, pos.lat)


async def update_game_session_position(
    conn: Connection, user_id: int, pos: Coords
) -> None:
    query = """
    UPDATE game_sessions
    SET location = ST_SetSRID(ST_MakePoint($1, $2), 4326)
    WHERE user_id = $3;
    """
    await conn.execute(query, pos.lon, pos.lat, user_id)
