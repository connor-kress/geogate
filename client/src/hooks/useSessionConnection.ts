import { connectSocket, disconnectSocket, setLocation } from "../utils/sockets";
import { useEffect } from "react";
import { useLocation } from "./useLocation";
import { useNodeStore } from "../stores/nodeStore";

export function useSessionConnection() {
  const { position } = useLocation();

  const fetchNodes = useNodeStore((state) => state.fetchNodes);

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
    setLocation(position);

    // console.log("\tcalling fetchNodes");
    fetchNodes(position);
  }, [position]);
}
