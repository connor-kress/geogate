import { handleMessage } from "../handlers/socketHandlers";
import { useSessionStore } from "../stores/sessionStore";

export function connectSocket(onConnected?: (s: WebSocket) => void) {
  const { setSocket, connecting, setConnecting } = useSessionStore.getState();
  if (connecting) {
    console.log("Trying to connect to socket while connecting");
    return;
  }
  setConnecting(true);
  try {
    const socketUrl = "ws://localhost:8000/session/ws";
    const socket = new WebSocket(socketUrl);
    socket.onopen = () => {
      console.log("WebSocket connected");
      setConnecting(false);
      if (onConnected) onConnected(socket);
    };
    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log("Message received:", data);
      handleMessage(data);
    };
    socket.onclose = (event) => {
      console.log(
        `WebSocket disconnected: code=${event.code}, reason=${event.reason}`);
      setSocket(null);
    };
    socket.onerror = (err) => {
      console.error("WebSocket error:", err);
      setConnecting(false);
      socket.close();
    }
    setSocket(socket);
  } catch (error) {
    setSocket(null);
    setConnecting(false);
    throw error;
  }
}

export function disconnectSocket() {
  const { socket, setSocket } = useSessionStore.getState()
  if (socket) {
    socket.close(1000, "User disconnected");
    setSocket(null);
  }
}

export function sendMessage(message: object) {
  const { socket } = useSessionStore.getState();
  if (!socket || socket.readyState !== WebSocket.OPEN) {
    console.error("WebSocket is not connected or not ready to send messages.");
    return;
  }
  try {
    const jsonString = JSON.stringify(message);
    socket.send(jsonString);
    console.log("Message sent:", message);
  } catch (error) {
    console.error("Failed to send WebSocket message:", error);
  }
}
