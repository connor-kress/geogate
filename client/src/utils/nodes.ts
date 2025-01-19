import { fetchResourceNodes } from "../api/http/resourceNodes";
import { useNodeStore } from "../stores/nodeStore";
import { NodeType } from "../types";

export async function fetchAndStoreResourceNodes() {
  const { setNodes, setIsLoading, setError } = useNodeStore.getState();

  setIsLoading(true);
  setError(null);

  try {
    const newNodes = await fetchResourceNodes();
    setNodes(newNodes || []);
  } catch (err) {
    console.error('Error fetching resource nodes:', err);
    setError(err instanceof Error ? err : new Error('Failed to fetch nodes'));
    setNodes([]);
  } finally {
    setIsLoading(false);
  }
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
