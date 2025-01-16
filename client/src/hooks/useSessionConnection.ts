import { connectSocket, disconnectSocket } from "../utils/sockets";
import { useEffect } from "react";
import { useLocation } from "./useLocation";
import { setAndStoreLocation } from "../utils/location";
import { requestResourceNodes } from "../api/websocket/resourceNodes";
import { useSessionStore } from "../stores/sessionStore";
import { useNodeStore } from "../stores/nodeStore";

export function useSessionConnection() {
  const { position } = useLocation();
  const setNodes = useNodeStore((state) => state.setNodes);
  const socketReadyState = useSessionStore((state) => state.socket?.readyState);
  const connecting = useSessionStore((state) => state.connecting);

  useEffect(() => {
    console.warn("Calling connectSocket")
    connectSocket();
    return () => {
      console.warn("Calling disconnectSocket in cleanup")
      disconnectSocket();
    }
  }, []);

  // Update stored position when position changes and fetch nodes
  useEffect(() => {
    setAndStoreLocation(position);
    requestResourceNodes();
    const shouldReconnect = (
      socketReadyState === WebSocket.CLOSED
      || socketReadyState === undefined
    ) && !connecting;
    // Effectively on timer when not connected
    if (shouldReconnect) connectSocket();
  }, [position]);

  // Clear resource nodes on disconnection
  useEffect(() => {
    if (socketReadyState === WebSocket.CLOSED
     || socketReadyState === undefined) {
    setNodes([]);
    }
  }, [socketReadyState])
}
