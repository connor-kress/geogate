from asyncpg import Pool
from fastapi import WebSocket
from db.nodes import get_resource_nodes_of_user
from models import User


async def handle_get_resource_nodes(websocket: WebSocket, user: User) -> None:
    pool: Pool = websocket.app.state.db_pool
    async with pool.acquire() as conn:
        nodes = await get_resource_nodes_of_user(conn, user.id)
    response = {
        "type": "resource_nodes",
        "data": [node.model_dump_json() for node in nodes],
    }
    await websocket.send_json(response)
