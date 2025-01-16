from asyncpg import UniqueViolationError
from fastapi import WebSocket
from pydantic import ValidationError
from typing import Any, Optional
from db.session import create_game_session, update_game_session_position
from models import Coords, User


async def handle_location_update(
    websocket: WebSocket, user: User, location: Any,
    auth_session_id: int, created_session: bool
) -> Optional[bool]:
    """Returns new `created_session` value or `None` to not update."""
    if location is None:
        print("No location passed to WebSocket by "
              f"{user.username} ({user.id}): {location}")
        return
    if not isinstance(location, dict):
        # Handle null location update
        print("Invalid location passed to WebSocket by "
              f"{user.username} ({user.id}): {location}")
        return
    try:
        location_obj = Coords.model_validate(location)
    except ValidationError:
        print("Invalid location passed to WebSocket by "
              f"{user.username} ({user.id}): {location}")
        return
    async with websocket.app.state.db_pool.acquire() as conn:
        if created_session:
            print(f"Updating game session: {user.username} ({user.id})")
            await update_game_session_position(conn, user.id,
                                               location_obj)
        else:
            print(f"Creating game session: {user.username} ({user.id})")
            try:
                await create_game_session(conn, user.id,
                                          auth_session_id, location_obj)
                return True
            except UniqueViolationError:
                await update_game_session_position(
                    conn, user.id, location_obj
                )
                print("\tFound existing game session")
