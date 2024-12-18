import random
from enum import Enum
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from util import to_camel_case

app = FastAPI()

allowed_origins = [
    "http://localhost:5173",  # Frontend's URL
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)


class NodeType(str, Enum):
    TREE = "tree"
    ROCK_BASIC = "rockBASIC"
    ROCK_COPPER = "rockCopper"
    ROCK_IRON = "rockIron"


NODE_TYPE_WEIGHTS = {
    NodeType.TREE: 100,
    NodeType.ROCK_BASIC: 40,
    NodeType.ROCK_COPPER: 25,
    NodeType.ROCK_IRON: 15,
}


def get_random_node_type() -> NodeType:
    types = list(NODE_TYPE_WEIGHTS.keys())
    weights = list(NODE_TYPE_WEIGHTS.values())
    return random.choices(types, weights=weights, k=1)[0]


class ResourceNode(BaseModel):
    id: int
    node_type: NodeType
    lat: float = Field(ge=-90, le=90)  # -90 <= lat <= 90
    lon: float = Field(ge=-180, le=180)  # -180 <= lon <= 180

    class Config:
        alias_generator = to_camel_case
        populate_by_name = True
        allow_population_by_field_name = True


@app.get("/api")
async def get_root():
    return {"message": "This is an API"}


@app.get("/api/nodes")
async def get_nodes(lat: float, lon: float, radius: float) -> list[ResourceNode]:
    # Convert from meters to degrees latitude/longitude
    lat_offset = radius / 111_111
    lon_offset = radius / 111_321
    # Mock data
    return [
        ResourceNode(
            id=int(random.randint(0, 1000000)),
            node_type=get_random_node_type(),
            lat=lat + lat_offset*(random.random()-0.5)*2,
            lon=lon + lon_offset*(random.random()-0.5)*2,
        )
        for _ in range(10)
    ]
