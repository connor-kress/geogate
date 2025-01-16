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

export const NODE_TYPE_WEIGHTS: { [key in NodeType]: number } = {
  [NodeType.TREE]: 100,
  [NodeType.ROCK_BASIC]: 40,
  [NodeType.ROCK_COPPER]: 25,
  [NodeType.ROCK_IRON]: 15,
};

export function getRandomNodeType(): NodeType {
  const types = Object.keys(NODE_TYPE_WEIGHTS) as NodeType[];
  const weights = Object.values(NODE_TYPE_WEIGHTS);

  const totalWeight = weights.reduce((acc, weight) => acc + weight, 0);
  let randomValue = Math.random() * totalWeight;

  for (let i = 0; i < types.length; i++) {
    randomValue -= weights[i];
    if (randomValue <= 0) {
      return types[i];
    }
  }

  // Default return, should not reach here
  return types[0];
}
