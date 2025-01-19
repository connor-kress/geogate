import { handleInventory } from "./inventoryHandlers";
import {
  handleCollectResourceNodeError,
  handleResourceNodes,
} from "./resourceNodesHandlers";

export function handleMessage(messageData: any) {
  const { type, data } = messageData;
  switch (type) {
    case "resource_nodes":
      handleResourceNodes(data);
      break;

    case "inventory":
      handleInventory(data);
      break;

    case "collect_resource_node_error":
      handleCollectResourceNodeError(data);
      break;

    default:
      console.warn("Unhandled WebSocket message type:", type, data);
  }
}
