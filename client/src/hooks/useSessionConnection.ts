import { useEffect } from "react";
import { useLocation } from "./useLocation";
import { setAndStoreLocation } from "../utils/location";
import { requestInventory } from "../api/websocket/inventory";
import { requestResourceNodes } from "../api/websocket/resourceNodes";
import { useSessionStore } from "../stores/sessionStore";
import { useNodeStore } from "../stores/nodeStore";
import { handleInventory } from "../handlers/inventoryHandlers";
import {
  handleCollectResourceNodeError,
  handleResourceNodes,
} from "../handlers/resourceNodesHandlers";

export function useSessionConnection() {
  const { position } = useLocation(); // Custom hook to get location
  const setNodes = useNodeStore((state) => state.setNodes);
  const socketManager = useSessionStore((state) => state.socketManager);

  useEffect(() => {
    if (!socketManager) {
      console.warn("WebSocketManager is not initialized");
      return;
    }

    console.warn("Connecting WebSocket...");
    socketManager.connect();

    const controller = new AbortController();
    const { signal } = controller;

    // Add listeners for unprompted updates
    socketManager.addListener("resource_nodes", handleResourceNodes, signal);
    socketManager.addListener("inventory", handleInventory, signal);
    socketManager.addListener("collect_resource_node_error",
                              handleCollectResourceNodeError, signal);

    return () => {
      console.warn("Disconnecting WebSocket in cleanup...");
      socketManager.disconnect();

      // Remove listeners
      controller.abort();
    };
  }, [socketManager, setNodes]);

  // Update stored position and request data when position changes
  useEffect(() => {
    if (!socketManager) {
      console.warn("WebSocketManager is not initialized");
      return;
    }

    console.log("Position updated:", position);
    // Send location update to server
    setAndStoreLocation(position);
    // Request inventory and resource nodes
    requestInventory();
    requestResourceNodes();

    // Handle possible reconnection
    const { readyState } = useSessionStore.getState()
    const shouldReconnect = (
      readyState === WebSocket.CLOSED
      || readyState === null
      || readyState === undefined
    );
    // Effectively on timer when not connected
    // Should employ more advanced management with exponential backoff
    if (shouldReconnect) socketManager.connect();
  }, [position, socketManager]);

  // Clear resource nodes on WebSocket disconnection
  useEffect(() => {
    if (!socketManager) {
      console.warn("WebSocketManager is not initialized");
      return;
    }

    const { readyState } = useSessionStore.getState()
    if (readyState === null || readyState === WebSocket.CLOSED) {
      console.log("WebSocket disconnected. Clearing resource nodes...");
      setNodes([]);
    }
  }, [socketManager, setNodes]);
}

// export function useSessionConnection() {
//   const { position } = useLocation();
//   const setNodes = useNodeStore((state) => state.setNodes);
//   const socketReadyState = useSessionStore((state) => state.socket?.readyState);
//   const connecting = useSessionStore((state) => state.connecting);
//
//   useEffect(() => {
//     console.warn("Calling connectSocket")
//     connectSocket();
//     return () => {
//       console.warn("Calling disconnectSocket in cleanup")
//       disconnectSocket();
//     }
//   }, []);
//
//   // Update stored position when position changes and fetch nodes
//   useEffect(() => {
//     setAndStoreLocation(position);
//     requestInventory();
//     requestResourceNodes();
//
//     const shouldReconnect = (
//       socketReadyState === WebSocket.CLOSED
//       || socketReadyState === undefined
//     ) && !connecting;
//     // Effectively on timer when not connected
//     if (shouldReconnect) connectSocket();
//   }, [position]);
//
//   // Clear resource nodes on disconnection
//   useEffect(() => {
//     if (socketReadyState === WebSocket.CLOSED
//      || socketReadyState === undefined) {
//     setNodes([]);
//     }
//   }, [socketReadyState])
// }
