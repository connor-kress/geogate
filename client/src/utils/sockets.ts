import { useSessionStore } from "../stores/sessionStore";

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
