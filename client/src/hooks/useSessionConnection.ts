import { connectSocket, disconnectSocket } from "../utils/sockets";
import { useEffect } from "react";
import { useLocation } from "./useLocation";
import { setAndStoreLocation } from "../utils/location";
import { requestResourceNodes } from "../api/websocket/resourceNodes";

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
    requestResourceNodes();
  }, [position]);
}
