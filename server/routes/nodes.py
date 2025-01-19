from asyncpg import Pool
from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel, Field
from db.nodes import (
    get_resource_nodes_within_radius,
    get_resource_nodes_of_user,
    insert_resource_node,
)
from models import Coords, NodeType, ResourceNode

router = APIRouter()


@router.get("")
async def get_nodes_by_user(
    user_id: int, request: Request
) -> list[ResourceNode]:
    # TODO: Remove temporary route (unsafe)
    pool: Pool = request.app.state.db_pool
    async with pool.acquire() as conn:
        nodes = await get_resource_nodes_of_user(conn, user_id)
    # print(f"Fetched {len(nodes)} nodes of user ({user_id})")
    return nodes


@router.get("by_radius/")
async def get_nodes_by_radius(
        lat: float, lon: float, radius: float, request: Request
) -> list[ResourceNode]:
    """A development route for fetching all resource nodes
    within a radius (in meters) of a location (admin only).
    """
    # TODO: Check for admin user session token
    coords = Coords(lat=lat, lon=lon)
    pool: Pool = request.app.state.db_pool
    async with pool.acquire() as conn:
        nodes = await get_resource_nodes_within_radius(conn, coords, radius)
    # print(f"Fetched {len(nodes)} nodes around {coords}")
    return nodes


class NodeCreate(BaseModel):
    user_id: int = Field(..., alias="userId")
    node_type: NodeType = Field(..., alias="nodeType")
    coords: Coords


@router.post("")
async def post_node(body: NodeCreate, request: Request):
    """A development route for creating a resource node (admin only)."""
    # TODO: Check for admin user session token
    pool: Pool = request.app.state.db_pool
    async with pool.acquire() as conn:
        node_id = await insert_resource_node(
            conn, body.user_id, body.node_type, body.coords
        )
        if not isinstance(node_id, int):
            raise HTTPException(
                status_code=500,
                detail="Unable to create node with unknown reason",
            )
    # print(f"Inserted node (id={node_id}) at {body.coords}")
    return {"id": node_id}
