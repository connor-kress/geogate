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

export type ResourceNode = {
  id: number,
  userId: number,
  nodeType: NodeType,
  coords: Coords,
  createdAt: Date,
};

export enum NodeType {
  TREE = "tree",
  ROCK_BASIC = "rockBasic",
  ROCK_COPPER = "rockCopper",
  ROCK_IRON = "rockIron",
};
