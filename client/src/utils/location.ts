import { useSessionStore } from "../stores/sessionStore";
import { Coords } from "../types";

export function setAndStoreLocation(newLocation: Coords | null) {
  // Maybe don't update location if it hasn't changed
  const { setLocation, socketManager, readyState } = useSessionStore.getState();
  setLocation(newLocation);
  const message = {
    type: "location_update",
    data: newLocation,
  };
  if (readyState === WebSocket.OPEN && socketManager) {
    socketManager.sendMessage(message)
  } else {
    console.warn("Location not sent as WebSocket is not open");
  }
}
