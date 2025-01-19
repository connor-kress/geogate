import { sendMessage } from "../../utils/socket";

export function requestResourceNodes() {
  const message = { "type": "get_resource_nodes" };
  sendMessage(message)
};
