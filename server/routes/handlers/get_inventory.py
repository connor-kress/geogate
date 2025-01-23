from db.items import get_user_inventory
from models import User
from utils.websocket_manager import WebSocketManager


async def handle_get_inventory(manager: WebSocketManager, user: User) -> None:
    pool = manager.get_db_pool(user.id)
    async with pool.acquire() as conn:
        items = await get_user_inventory(conn, user.id)
    item_jsons = [item.model_dump(by_alias=True) for item in items]
    response = {
        "type": "inventory",
        "data": item_jsons,
    }
    await manager.send_json(user.id, response)
