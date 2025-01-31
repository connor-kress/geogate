import { Pressable, Text } from "react-native";
import { insertResourceNode } from "../api/http/resourceNodes";
import { requestResourceNodes } from "../api/websocket/resourceNodes";
import { useSessionStore } from "../stores/sessionStore";
import { getRandomNodeType } from "../utils/nodes";
import { getRandomCoordinates } from "../utils/coords";

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
      requestResourceNodes();
    }
  }

  return (
    <Pressable
      className="bg-zinc-600 px-4 py-1 rounded active:bg-zinc-500"
      onPress={insertRandomNode}
    >
      <Text className="text-white">Generate New Node</Text>
    </Pressable>
  );
}
