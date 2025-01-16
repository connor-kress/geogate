import { sendMessage } from "../../utils/sockets";

export async function requestResourceNodes() {
  const message = { "type": "get_resource_nodes" };
  sendMessage(message)
};
