from asyncpg import Pool
from fastapi import WebSocket
from db.items import get_user_inventory
from models import User


async def handle_get_inventory(websocket: WebSocket, user: User) -> None:
    pool: Pool = websocket.app.state.db_pool
    async with pool.acquire() as conn:
        items = await get_user_inventory(conn, user.id)
    item_jsons = [item.model_dump(by_alias=True) for item in items]
    response = {
        "type": "inventory",
        "data": item_jsons,
    }
    await websocket.send_json(response)
