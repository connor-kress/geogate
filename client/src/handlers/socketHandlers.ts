import { handleResourceNodes } from "./resourceNodesHandler";

export function handleMessage(messageData: any) {
  const { type, data } = messageData;

  switch (type) {
    case "resource_nodes":
      handleResourceNodes(data); // Call the specific handler for "resource_nodes"
      break;

    default:
      console.warn("Unhandled WebSocket message type:", type, data);
  }
}
