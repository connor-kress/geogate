from asyncpg import Pool
from fastapi import WebSocket
from db.nodes import get_resource_nodes_of_user
from models import User


async def handle_get_resource_nodes(websocket: WebSocket, user: User) -> None:
    pool: Pool = websocket.app.state.db_pool
    async with pool.acquire() as conn:
        nodes = await get_resource_nodes_of_user(conn, user.id)
    node_jsons = [node.model_dump(by_alias=True) for node in nodes]
    for node in node_jsons:
        node["createdAt"] = node["createdAt"].isoformat()
    response = {
        "type": "resource_nodes",
        "data": node_jsons,
    }
    await websocket.send_json(response)
