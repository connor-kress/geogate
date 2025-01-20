import { useSessionStore } from "../../stores/sessionStore";

export function requestResourceNodes() {
  const { socketManager } = useSessionStore.getState()
  const message = { type: "get_resource_nodes" };
  socketManager?.sendMessage(message)
};

export function collectResourceNode(node_id: number) {
  const { socketManager } = useSessionStore.getState()
  const message = {
    type: "collect_resource_node",
    data: node_id,
  };
  socketManager?.sendMessage(message)
}
