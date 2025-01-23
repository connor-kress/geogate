import { useSessionStore } from "../../stores/sessionStore";

export function requestResourceNodes() {
  const { socketManager } = useSessionStore.getState()
  const message = { type: "get_resource_nodes" };
  socketManager?.sendMessage(message)
};

export async function collectResourceNode(node_id: number) {
  const { socketManager } = useSessionStore.getState()
  if (!socketManager) {
    console.warn("Attemped to collect node without valid socketManager");
    return;
  }
  const res = await socketManager.sendRequest(
    "collect_resource_node", node_id
  );
  console.log("Collection response:", res);
}
