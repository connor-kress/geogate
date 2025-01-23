from typing import Any
from db.items import get_user_inventory, insert_or_add_items
from db.nodes import delete_resource_node, get_resource_node, get_resource_nodes_of_user
from models import User
from utils.nodes import get_node_item_drops
from utils.websocket_manager import WebSocketManager


async def handle_collect_resource_node(
    manager: WebSocketManager, user: User, node_id: Any, request_id: Any
) -> None:
    async def handle_invalid_param_error(param_name: str, param: Any):
        print(f"Invalid {param_name} passed to WebSocket by "
              f"{user.username} ({user.id}): {param}")
        error = {
            "type": "error",
            "requestId": request_id,
            "error": f"Invalid {param_name}",
        }
        await manager.send_json(user.id, error)


    if not isinstance(node_id, int):
        await handle_invalid_param_error("node_id", node_id)
        return
    if not isinstance(request_id, str):
        await handle_invalid_param_error("request_id", request_id)
        return
    pool = manager.get_db_pool(user.id)
    async with pool.acquire() as conn:
        node = await get_resource_node(conn, node_id, user.id)
        if node is None:
            await handle_invalid_param_error("node_id", node_id)
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
    primary_response = {
        "type": "success",
        "requestId": request_id,
        "data": new_items,
    }
    await manager.send_json(user.id, primary_response)
    await manager.send_json(user.id, inventory_response)
    await manager.send_json(user.id, nodes_response)
