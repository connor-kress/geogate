export type Screen = "login" | "register" | "game";
export type ScreenHandler = (screen: Screen) => void;

export type User =  {
  id: number,
  username: string,
  email: string | null,
  createdAt: string,  // Parse into actual datetime?
};

export type Coords = {
  lat: number, // constrained by -90 <= lat <= 90
  lon: number, // constrained by -180 <= lon <= 180
};

export enum NodeType {
  TREE = "tree",
  ROCK_BASIC = "rockBasic",
  ROCK_COPPER = "rockCopper",
  ROCK_IRON = "rockIron",
};

export type ResourceNode = {
  id: number,
  userId: number,
  nodeType: NodeType,
  coords: Coords,
  createdAt: Date,
};

export enum ItemType {
    BASIC_WOOD = "basicWood",
    BASIC_STONE = "basicStone",
    COPPER_ORE = "copperOre",
    IRON_ORE = "ironOre",
}

export type Item = {
    id: number,
    userId: number,
    itemType: ItemType,
    itemCount: number | null,
    metadata: any | null,
}

export type ItemTypeMetadata = {
  name: string;
  type: string;
  displayName: string;
};
