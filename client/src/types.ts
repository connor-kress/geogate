export enum NodeType {
    TREE = "tree",
    ROCK_BASIC = "rockBASIC",
    ROCK_COPPER = "rockCopper",
    ROCK_IRON = "rockIron",
}

export type ResourceNode = {
    id: number,
    nodeType: NodeType,
    lat: number, // constrained by -90 <= lat <= 90
    lon: number, // constrained by -180 <= lon <= 180
}
