import random
from constants import NODE_ITEM_DROPS, NODE_TYPE_WEIGHTS
from models import ItemType, NodeType


def get_random_node_type() -> NodeType:
    types = list(NODE_TYPE_WEIGHTS.keys())
    weights = list(NODE_TYPE_WEIGHTS.values())
    return random.choices(types, weights=weights, k=1)[0]


def get_node_item_drops(node_type: NodeType) -> list[tuple[ItemType, int]]:
    drops = []
    for item_type, bounds in NODE_ITEM_DROPS[node_type]:
        count = random.randint(*bounds)
        drops.append((item_type, count))
    return drops
