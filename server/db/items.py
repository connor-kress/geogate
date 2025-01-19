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


async def insert_or_add_item(
    conn: Connection,
    user_id: int,
    item_type: str,
    item_count: Optional[int],
    metadata: Optional[dict],
) -> Optional[int]:
    """ Inserts or updates a user item in the database.
    If item is non-stackable, inserts a new row.
    If item is stackable, adds to the existing count or creates a new row.
    Returns the ID of the affected row.
    """
    if item_count is None:  # Non-stackable
        query = """
        INSERT INTO user_items (user_id, item_type, item_count, metadata)
        VALUES ($1, $2, NULL, $3)
        RETURNING id;
        """
        res = await conn.fetchval(query, user_id, item_type, metadata)
    else:  # Stackable
        query = """
        INSERT INTO user_items (user_id, item_type, item_count, metadata)
        VALUES ($1, $2, $3, NULL)
        ON CONFLICT (user_id, item_type) WHERE item_count IS NOT NULL
        DO UPDATE
        SET item_count = user_items.item_count + EXCLUDED.item_count
        RETURNING id;
        """
        res = await conn.fetchval(query, user_id, item_type, item_count)
    
    return res
