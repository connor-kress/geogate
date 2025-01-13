from datetime import datetime
from enum import Enum
from typing import Optional
from pydantic import BaseModel, Field


class Coords(BaseModel):
    lat: float = Field(ge=-90, le=90)  # -90 <= lat <= 90
    lon: float = Field(ge=-180, le=180)  # -180 <= lon <= 180


class NodeType(str, Enum):
    TREE = "tree"
    ROCK_BASIC = "rockBasic"
    ROCK_COPPER = "rockCopper"
    ROCK_IRON = "rockIron"


NODE_TYPE_WEIGHTS = {
    NodeType.TREE: 100,
    NodeType.ROCK_BASIC: 40,
    NodeType.ROCK_COPPER: 25,
    NodeType.ROCK_IRON: 15,
}


class ResourceNode(BaseModel):
    id: int
    node_type: NodeType = Field(..., alias="nodeType")
    coords: Coords

    class Config:
        populate_by_name = True


class User(BaseModel):
    id: int
    username: str
    email: Optional[str]
    created_at: datetime = Field(..., alias="createdAt")

    class Config:
        populate_by_name = True


class GameSession(BaseModel):
    id: int
    user_id: int = Field(..., alias="userId")
    auth_session_id: int = Field(..., alias="authSessionId")
    location: Coords
    created_at: datetime = Field(..., alias="createdAt")

    class Config:
        populate_by_name = True
