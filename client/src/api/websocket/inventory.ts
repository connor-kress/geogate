import { sendMessage } from "../../utils/socket";

export function requestInventory() {
  const message = { "type": "get_inventory" };
  sendMessage(message)
};
