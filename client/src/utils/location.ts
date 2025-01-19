import { useSessionStore } from "../stores/sessionStore";
import { Coords } from "../types";
import { sendMessage } from "./socket";

export function setAndStoreLocation(newLocation: Coords | null) {
  // Maybe don't update location if it hasn't changed
  const { setLocation, socket } = useSessionStore.getState();
  setLocation(newLocation);
  const message = {
    type: "location_update",
    data: newLocation,
  };
  if (socket && socket.readyState === WebSocket.OPEN) {
    sendMessage(message)
  } else {
    console.warn("Location not sent as WebSocket is not open");
  }
}
