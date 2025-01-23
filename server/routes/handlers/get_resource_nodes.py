from db.nodes import get_resource_nodes_of_user
from models import User
from utils.websocket_manager import WebSocketManager


async def handle_get_resource_nodes(
    manager: WebSocketManager, user: User
) -> None:
    pool = manager.get_db_pool(user.id)
    async with pool.acquire() as conn:
        nodes = await get_resource_nodes_of_user(conn, user.id)
    node_jsons = [node.model_dump(by_alias=True) for node in nodes]
    for node in node_jsons:
        node["createdAt"] = node["createdAt"].isoformat()
    response = {
        "type": "resource_nodes",
        "data": node_jsons,
    }
    await manager.send_json(user.id, response)
