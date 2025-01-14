import random
from asyncpg import Pool
from fastapi import APIRouter, Request
from pydantic import BaseModel, Field
from db.nodes import get_nodes_within_radius, insert_resource_node
from models import NODE_TYPE_WEIGHTS, Coords, NodeType, ResourceNode

router = APIRouter()


def get_random_node_type() -> NodeType:
    types = list(NODE_TYPE_WEIGHTS.keys())
    weights = list(NODE_TYPE_WEIGHTS.values())
    return random.choices(types, weights=weights, k=1)[0]


def parse_node_type(type_str: str) -> NodeType:
    NODE_TYPE_WEIGHTS.keys()
    return NodeType(type_str)


@router.get("")
async def get_nodes(lat: float, lon: float, request: Request) -> list[ResourceNode]:
    coords = Coords(lat=lat, lon=lon)
    radius = 1000  # 1km
    pool: Pool = request.app.state.db_pool
    async with pool.acquire() as conn:
        nodes = await get_nodes_within_radius(conn, coords, radius)
    # print(f"Fetched {len(nodes)} nodes around {coords}")
    return nodes


class NodeCreate(BaseModel):
    node_type: NodeType = Field(..., alias="nodeType")
    coords: Coords


@router.post("")
async def post_node(body: NodeCreate, request: Request):
    pool: Pool = request.app.state.db_pool
    async with pool.acquire() as conn:
        node_id = await insert_resource_node(conn, body.node_type, body.coords)
    # print(f"Inserted node (id={node_id}) at {body.coords}")
    return {"id": node_id}
