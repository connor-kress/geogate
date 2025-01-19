from typing import Optional
from asyncpg import Connection
from models import Coords, NodeType, ResourceNode


async def get_resource_nodes_within_radius(
    conn: Connection, coords: Coords, radius: float
):
    """Returns all the resource nodes within a radius (in meters)
    of a location.
    """
    query = """
    SELECT
        id,
        user_id,
        node_type,
        ST_Y(location::geometry) AS lat,
        ST_X(location::geometry) AS lon,
        created_at
    FROM
        resource_nodes
    WHERE
        ST_DWithin(
            location,
            ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography,
            $3
        );
    """
    rows = await conn.fetch(query, coords.lon, coords.lat, radius)
    return [
        ResourceNode(
            id=row["id"],
            userId=row["user_id"],
            nodeType=row["node_type"],
            coords=Coords(lat=row["lat"],
                          lon=row["lon"]),
            createdAt=row["created_at"],
        )
        for row in rows
    ]


async def get_resource_nodes_of_user(
    conn: Connection, user_id: int
) -> list[ResourceNode]:
    """Returns all the resource nodes associated with a given user."""
    query = """
    SELECT
        id,
        user_id,
        node_type,
        ST_Y(location::geometry) AS lat,
        ST_X(location::geometry) AS lon,
        created_at
    FROM resource_nodes
    WHERE user_id = $1;
    """
    rows = await conn.fetch(query, user_id)
    return [
        ResourceNode(
            id=row["id"],
            userId=row["user_id"],
            nodeType=row["node_type"],
            coords=Coords(lat=row["lat"],
                          lon=row["lon"]),
            createdAt=row["created_at"],
        )
        for row in rows
    ]


async def get_resource_node(
        conn: Connection, node_id: int, user_id: int
) -> Optional[ResourceNode]:
    """Returns a resource node based on ID for a given user."""
    query = """
    SELECT
        id,
        user_id,
        node_type,
        ST_Y(location::geometry) AS lat,
        ST_X(location::geometry) AS lon,
        created_at
    FROM resource_nodes
    WHERE id = $1
    AND user_id = $2;
    """
    row = await conn.fetchrow(query, node_id, user_id)
    if row is None:
        return None
    return ResourceNode(
        id=row["id"],
        userId=row["user_id"],
        nodeType=row["node_type"],
        coords=Coords(lat=row["lat"],
                      lon=row["lon"]),
        createdAt=row["created_at"],
    )


async def insert_resource_node(
    conn: Connection, user_id: int, node_type: NodeType, coords: Coords
) -> Optional[int]:
    """Inserts a new resource node into the database and
    returns its ID.
    """
    query = """
    INSERT INTO resource_nodes (user_id, node_type, location)
    VALUES ($1, $2, ST_SetSRID(ST_MakePoint($3, $4), 4326))
    RETURNING id;
    """
    res = await conn.fetchval(
        query, user_id, node_type.value, coords.lon, coords.lat
    )
    return res


async def delete_resource_node(
    conn: Connection, node_id: int, user_id: int
) -> None:
    """Deletes a resource node from the database."""
    query = """
    DELETE FROM resource_nodes
    WHERE id = $1
    AND user_id = $2
    RETURNING id;
    """
    res = await conn.execute(query, node_id, user_id)
    if res == "DELETE 0":
        raise Exception(
            f"Node {node_id} not found or not owned by user {user_id}"
        )
