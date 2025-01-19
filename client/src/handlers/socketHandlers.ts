import { handleInventory } from "./inventoryHandler";
import { handleResourceNodes } from "./resourceNodesHandler";

export function handleMessage(messageData: any) {
  const { type, data } = messageData;
  switch (type) {
    case "resource_nodes":
      handleResourceNodes(data);
      break;

    case "inventory":
      handleInventory(data);
      break;

    default:
      console.warn("Unhandled WebSocket message type:", type, data);
  }
}
