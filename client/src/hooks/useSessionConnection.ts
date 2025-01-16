import { connectSocket, disconnectSocket } from "../utils/sockets";
import { useEffect } from "react";
import { useLocation } from "./useLocation";
import { fetchAndStoreResourceNodes } from "../utils/nodes";
import { setAndStoreLocation } from "../utils/location";

export function useSessionConnection() {
  const { position } = useLocation();

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
    // console.log("\tcalling setLocation");
    setAndStoreLocation(position);

    // console.log("\tcalling fetchNodes");
    fetchAndStoreResourceNodes();
  }, [position]);
}
