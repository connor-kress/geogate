import { sendMessage } from "../../utils/socket";

export function requestResourceNodes() {
  const message = { type: "get_resource_nodes" };
  sendMessage(message)
};

export function collectResourceNode(node_id: number) {
  const message = {
    type: "collect_resource_node",
    data: node_id,
  };
  sendMessage(message)
}
