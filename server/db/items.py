from typing import Optional
from asyncpg import Connection
from models import Item, ItemType


async def get_user_inventory(conn: Connection, user_id: int) -> list[Item]:
    """Returns all the items in a given user's inventory."""
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
    item_type: ItemType,
    item_count: Optional[int],
    metadata: Optional[dict] = None,
) -> Optional[int]:
    """Inserts or updates a user item in the database.
    If item is non-stackable, inserts a new row.
    If item is stackable, adds to the existing count or creates a new row.
    Returns the ID of the affected row.
    """
    ids = await insert_or_add_items(
        conn, user_id, [(item_type, item_count, metadata)]
    )
    return ids[0]


async def insert_or_add_items(
    conn: Connection,
    user_id: int,
    # List of (item_type, item_count, metadata)
    items: list[tuple[ItemType, Optional[int], Optional[dict]]],
) -> list[Optional[int]]:
    """Inserts or updates multiple user items in the database.
    If the item is non-stackable, inserts a new row.
    If the item is stackable, adds to the existing count or creates a new row.
    Returns a list of IDs of the affected rows.
    """
    query = """
    INSERT INTO user_items (user_id, item_type, item_count, metadata)
    VALUES ($1, $2, $3, $4)
    ON CONFLICT (user_id, item_type) WHERE item_count IS NOT NULL
    DO UPDATE
    SET item_count = user_items.item_count + EXCLUDED.item_count
    RETURNING id;
    """
    # Prepare the values for bulk insert
    insert_values = [(user_id, item_type, item_count, metadata)
                     for item_type, item_count, metadata in items]
    rows = await conn.fetchmany(query, insert_values)
    ids = [row["id"] for row in rows]
    return ids
