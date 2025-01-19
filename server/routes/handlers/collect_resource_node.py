from typing import Any
from asyncpg import Pool
from fastapi import WebSocket
from db.items import get_user_inventory, insert_or_add_items
from db.nodes import delete_resource_node, get_resource_node, get_resource_nodes_of_user
from models import User
from utils.nodes import get_node_item_drops


async def handle_collect_resource_node(
    websocket: WebSocket, user: User, node_id: Any
) -> None:
    async def handle_invalid_node_id_error():
        print("Invalid node_id passed to WebSocket by "
              f"{user.username} ({user.id}): {node_id}")
        error = {
            "type": "collect_resource_node_error",
            "data": "Invalid node_id",
        }
        await websocket.send_json(error)

    if not isinstance(node_id, int):
        await handle_invalid_node_id_error()
        return
    pool: Pool = websocket.app.state.db_pool
    async with pool.acquire() as conn:
        node = await get_resource_node(conn, node_id, user.id)
        if node is None:
            await handle_invalid_node_id_error()
            return
        await delete_resource_node(conn, node.id, user.id)
        new_items = get_node_item_drops(node.node_type)
        await insert_or_add_items(
            conn, user.id,
            [(item_type, item_count, None)
             for item_type, item_count in new_items]
        )
        items = await get_user_inventory(conn, user.id)
        nodes = await get_resource_nodes_of_user(conn, user.id)
    item_jsons = [item.model_dump(by_alias=True) for item in items]
    inventory_response = {
        "type": "inventory",
        "data": item_jsons,
    }
    node_jsons = [node.model_dump(by_alias=True) for node in nodes]
    for node in node_jsons:
        node["createdAt"] = node["createdAt"].isoformat()
    nodes_response = {
        "type": "resource_nodes",
        "data": node_jsons,
    }
    await websocket.send_json(inventory_response)
    await websocket.send_json(nodes_response)
