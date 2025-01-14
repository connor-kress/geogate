import { useSessionStore } from "../stores/sessionStore";
import { Coords } from "../types";

export function setLocation (newLocation: Coords | null) {
  // Maybe don't update location if it isn't changed
  const setStoreLocation = useSessionStore.getState().setLocation;
  const socket = useSessionStore.getState().socket;
  setStoreLocation(newLocation);
  if (socket && socket.readyState === WebSocket.OPEN) {
    const message = { location: newLocation };
    socket.send(JSON.stringify(message));
  } else {
    console.warn("WebSocket is not open. Location not sent.");
    connectSocket();
  }
}

export function connectSocket() {
  const setSocket = useSessionStore.getState().setSocket;
  const socketUrl = "ws://localhost:8000/session/ws";
  const socket = new WebSocket(socketUrl);
  socket.onopen = () => {
    console.log("WebSocket connected");
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
  const socket = useSessionStore.getState().socket;
  const setSocket = useSessionStore.getState().setSocket;
  if (socket) {
    socket.close(1000, "User disconnected");
    setSocket(null);
  }
}
