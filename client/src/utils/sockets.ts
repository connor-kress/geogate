import { useSessionStore } from "../stores/sessionStore";
import { Coords } from "../types";

export function setAndStoreLocation(newLocation: Coords | null) {
  // Maybe don't update location if it hasn't changed
  const { setLocation, socket } = useSessionStore.getState();
  setLocation(newLocation);
  const message = {
    type: "location_update",
    data: newLocation,
  };
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify(message));
  } else {
    console.warn("Location not sent as WebSocket is not open. Retrying");
    connectSocket((socket) => {
      if (socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify(message));
      } else {
        console.warn("Failed to send location even after reconnecting");
      }
    });
  }
}

export function connectSocket(onConnected?: (s: WebSocket) => void) {
  const { setSocket } = useSessionStore.getState();
  const socketUrl = "ws://localhost:8000/session/ws";
  const socket = new WebSocket(socketUrl);
  socket.onopen = () => {
    console.log("WebSocket connected");
    if (onConnected) onConnected(socket);
  };
  socket.onmessage = (event) => {
    const data = JSON.parse(event.data);
    console.log("Message received from server:", data);
    // Handle incoming messages
  };
  socket.onclose = (event) => {
    console.log(
      `WebSocket disconnected: code=${event.code}, reason=${event.reason}`);
    setSocket(null);
  };
  socket.onerror = (err) => {
    console.error("WebSocket error:", err);
    socket.close();
  }
  setSocket(socket);
}

export function disconnectSocket() {
  const { socket, setSocket } = useSessionStore.getState()
  if (socket) {
    socket.close(1000, "User disconnected");
    setSocket(null);
  }
}
