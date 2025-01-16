import { insertResourceNode } from "../queries";
import { useSessionStore } from "../stores/sessionStore";
import { getRandomNodeType } from "../types";
import { getRandomCoordinates } from "../utils/coords";
import { fetchAndStoreResourceNodes } from "../utils/nodes";

export function GenRandomNodeButton() {
  const position = useSessionStore((store) => store.location);

  async function insertRandomNode() {
    if (position === null) return;
    const radius = 200 // meters
    const coords = getRandomCoordinates(position, radius);
    const nodeType = getRandomNodeType();
    console.log(`Creating a ${nodeType} node at (${coords.lat}, ${coords.lon})`);
    const nodeId = await insertResourceNode(coords, nodeType);
    if (nodeId === null) {
      console.error('No returned node id');
    } else {
      console.log(`Successfully inserted node (id: ${nodeId})`);
      fetchAndStoreResourceNodes();
    }
  }

  return (
      <button
        className="bg-zinc-600 px-4 py-1 rounded hover:bg-zinc-500"
        onClick={insertRandomNode}
      >
        Generate New Node
      </button>
  );
}
