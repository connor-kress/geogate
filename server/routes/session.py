from asyncio import IncompleteReadError
from json.decoder import JSONDecodeError
from typing import Optional
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from db.auth import get_auth_session_id, get_user_from_auth_session
from db.session import get_game_session, remove_game_session
from routes.handlers.collect_resource_node import handle_collect_resource_node
from routes.handlers.get_resource_nodes import handle_get_resource_nodes
from routes.handlers.get_inventory import handle_get_inventory
from routes.handlers.location import handle_location_update
from utils.hashing import hash_sha256
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
    token_hash = hash_sha256(session_token)

    async with websocket.app.state.db_pool.acquire() as conn:
        user = await get_user_from_auth_session(conn, token_hash)
        auth_session_id = await get_auth_session_id(conn, token_hash)
        if user is not None:
            game_session = await get_game_session(conn, user.id)
            if game_session is not None:
                await websocket.close(code=1008, reason="Existing game session")
                print("WebSocket closing because of existing game session")
                return

    if user is None or auth_session_id is None:
        await websocket.close(code=1008, reason="Invalid session token cookie")
        print("WebSocket closing because of invalid session_token cookie")
        return
    await manager.connect(user.id, websocket)
    print(f"Added connection: {user.username} ({user.id})")
    await handle_get_resource_nodes(websocket, user)
    print("Sent resource nodes to "
          f"{user.username} ({user.id})")
    await handle_get_inventory(websocket, user)
    print("Sent user inventory to "
          f"{user.username} ({user.id})")

    try:
        created_session = False
        while True:
            try:
                payload = await websocket.receive_json()
            except JSONDecodeError:
                print("Invalid JSON passed to WebSocket by "
                      f"{user.username} ({user.id})")
                continue
            except IncompleteReadError:
                print("Incomplete read error from "
                      f"{user.username} ({user.id})")
                continue
            except RuntimeError:
                print("Connection unexpectedly closed: "
                      f"{user.username} ({user.id})")
                raise WebSocketDisconnect
            if not isinstance(payload, dict):
                print("Non-object JSON passed to WebSocket by "
                      f"{user.username} ({user.id}): {payload}")
                continue
            message_type = payload.get("type")
            data = payload.get("data")
            if message_type is None:
                print("No type field in message from "
                      f"{user.username} ({user.id})")
                continue
            if message_type == "location_update":
                if await handle_location_update(
                    websocket, user, data, auth_session_id, created_session
                ):
                    created_session = True
            elif message_type == "get_resource_nodes":
                await handle_get_resource_nodes(websocket, user)
                print("Sent resource nodes to "
                      f"{user.username} ({user.id})")
            elif message_type == "get_inventory":
                await handle_get_inventory(websocket, user)
                print("Sent user inventory to "
                      f"{user.username} ({user.id})")
            elif message_type == "collect_resource_node":
                await handle_collect_resource_node(websocket, user, data)
                print("Collecting resource node for"
                      f"{user.username} ({user.id})")
            else:
                print(f"Unknown message type {message_type} from "
                      f"{user.username} ({user.id})")
    except (WebSocketDisconnect, Exception) as err:
        if isinstance(err, WebSocketDisconnect):
            print(f"Lost connection: {user.username} ({user.id})")
        else:
            print(f"Unexpected error for {user.username} ({user.id}): {err}")
        await manager.disconnect(user.id)
        async with websocket.app.state.db_pool.acquire() as conn:
            print(f"Removing game session for {user.username} ({user.id})")
            await remove_game_session(conn, user.id)
