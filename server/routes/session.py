import base64
import hashlib
from json.decoder import JSONDecodeError
from typing import Optional
from asyncpg import UniqueViolationError
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from pydantic import ValidationError
from db.auth import get_auth_session_id, get_user_from_auth_session
from db.session import (
    create_game_session,
    get_game_session,
    remove_game_session,
    update_game_session_position,
)
from models import Coords
from utils.websocket_manager import WebSocketManager

router = APIRouter()
manager = WebSocketManager()


def parse_session_token_cookie(cookies: Optional[str]) -> Optional[str]:
    if not cookies:
        return None
    for cookie in cookies.split("; "):
            key, value = cookie.split("=", 1)
            if key == "session_token":
                return value
    return None


@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket) -> None:
    await websocket.accept()

    cookies = websocket.headers.get("cookie")
    session_token = parse_session_token_cookie(cookies)
    if session_token is None:
        # Policy violation
        await websocket.close(code=1008, reason="No session_token cookie")
        print("WebSocket closing because of no session_token cookie")
        return
    token_hash = base64.b64encode(
        hashlib.sha256(session_token.encode()).digest()
    ).decode()

    async with websocket.app.state.db_pool.acquire() as conn:
        user = await get_user_from_auth_session(conn, token_hash)
        auth_session_id = await get_auth_session_id(conn, token_hash)
        if user is not None:
            game_session = await get_game_session(conn, user.id)
            if game_session is not None:
                await websocket.close(code=1008, reason="Existing game session")
                print("WebSocket closing because of existing game session")

    if user is None or auth_session_id is None:
        await websocket.close(code=1008, reason="Invalid session token cookie")
        print("WebSocket closing because of invalid session_token cookie")
        return
    await manager.connect(user.id, websocket)
    print(f"Added connection: {user.username} ({user.id})")

    try:
        created_session = False
        while True:
            try:
                data = await websocket.receive_json()
            except JSONDecodeError:
                print("Invalid JSON passed to WebSocket by "
                      f"{user.username} ({user.id})")
                continue
            if not isinstance(data, dict):
                print("Non-object JSON passed to WebSocket by "
                      f"{user.username} ({user.id}): {data}")
                continue
            # Handle different message types here
            location = data.get("location")
            if location is None:
                print("No location passed to WebSocket by "
                      f"{user.username} ({user.id}): {data}")
                continue
            if not isinstance(location, dict):
                print("Invalid location passed to WebSocket by "
                      f"{user.username} ({user.id}): {location}")
                continue
            try:
                location_obj = Coords.model_validate(location)
            except ValidationError:
                print("Invalid location passed to WebSocket by "
                      f"{user.username} ({user.id}): {location}")
                continue
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
                    except UniqueViolationError:
                        await update_game_session_position(
                            conn, user.id, location_obj
                        )
                        print("\tFound existing game session")
                    created_session = True
    except WebSocketDisconnect:
        print(f"Lost connection: {user.username} ({user.id})")
        await manager.disconnect(user.id)
        async with websocket.app.state.db_pool.acquire() as conn:
            print(f"Removing game session for {user.username} ({user.id})")
            await remove_game_session(conn, user.id)
