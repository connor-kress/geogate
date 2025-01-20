import { useSessionStore } from "../../stores/sessionStore";

export function requestInventory() {
  const { socketManager } = useSessionStore.getState()
  const message = { type: "get_inventory" };
  socketManager?.sendMessage(message)
};
