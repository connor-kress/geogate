import { useEffect } from "react";
import { useLocation } from "./useLocation";
import { setAndStoreLocation } from "../utils/location";
import { requestInventory } from "../api/websocket/inventory";
import { requestResourceNodes } from "../api/websocket/resourceNodes";
import { useSessionStore } from "../stores/sessionStore";
import { useNodeStore } from "../stores/nodeStore";
import { handleInventory } from "../handlers/inventoryHandlers";
import { handleResourceNodes } from "../handlers/resourceNodesHandlers";

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

    // Add listeners for unprompted message handling
    socketManager.addListener("resource_nodes", handleResourceNodes, signal);
    socketManager.addListener("inventory", handleInventory, signal);

    return () => {
      console.warn("Disconnecting WebSocket in cleanup...");
      socketManager.disconnect();
      controller.abort();
    };
  }, [socketManager]);

  // Update stored position and request data when position changes
  useEffect(() => {
    if (!socketManager) {
      console.warn("WebSocketManager is not initialized");
      return;
    }

    console.log("Position updated:", position);
    setAndStoreLocation(position);
    requestInventory();
    requestResourceNodes();
  }, [position, socketManager]);

  // Clear resource nodes on WebSocket disconnection
  const { readyState } = useSessionStore.getState()
  useEffect(() => {
    if (!socketManager) {
      console.warn("WebSocketManager is not initialized");
      return;
    }

    if (readyState === null || readyState === WebSocket.CLOSED) {
      console.log("WebSocket disconnected. Clearing resource nodes...");
      setNodes([]);
    }
  }, [readyState, socketManager]);
}
