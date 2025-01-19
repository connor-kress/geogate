from typing import Optional
from asyncpg import Connection
from models import Item


async def get_items_of_user(conn: Connection, user_id: int) -> list[Item]:
    """Returns all the items associated with a given user."""
    query = """
    SELECT
        id,
        user_id,
        item_type,
        item_count,
        metadata
    FROM user_items
    WHERE user_id = $1;
    """
    rows = await conn.fetch(query, user_id)
    return [Item.model_validate(dict(row)) for row in rows]


async def insert_item(
    conn: Connection,
    user_id: int,
    item_type: str,
    item_count: Optional[int],
    metadata: Optional[dict],
) -> Optional[int]:
    """Inserts a new user item into the database and
    returns its ID.
    """
    query = """
    INSERT INTO user_items (user_id, item_type, item_count, metadata)
    VALUES ($1, $2, $3, $4)
    RETURNING id;
    """
    res = await conn.fetchval(
        query, user_id, item_type, item_count, metadata
    )
    return res
