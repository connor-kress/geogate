from models import ItemType, NodeType


NODE_TYPE_WEIGHTS = {
    NodeType.TREE: 100,
    NodeType.ROCK_BASIC: 40,
    NodeType.ROCK_COPPER: 25,
    NodeType.ROCK_IRON: 15,
}


NODE_ITEM_DROPS = {
    NodeType.TREE: [
        (ItemType.BASIC_WOOD, (2, 5)),
    ],
    NodeType.ROCK_BASIC: [
        (ItemType.BASIC_STONE, (2, 4)),
    ],
    NodeType.ROCK_COPPER: [
        (ItemType.BASIC_STONE, (1, 3)),
        (ItemType.COPPER_ORE, (1, 2)),
    ],
    NodeType.ROCK_IRON: [
        (ItemType.BASIC_STONE, (1, 3)),
        (ItemType.IRON_ORE, (1, 2)),
    ],
}
