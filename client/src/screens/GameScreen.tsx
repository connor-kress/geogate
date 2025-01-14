import { useEffect } from "react";
import { GameMap } from "../components/GameMap";
import { GenRandomNodeButton } from "../components/GenRandomNodeButton";
import { useLocation } from "../hooks/useLocation";
import { useUserStore } from "../stores/userStore";
import { ScreenHandler } from "../types";
import { useNodeStore } from "../stores/nodeStore";
import { LogoutButton } from "../components/LogoutButton";
import { useSessionStore } from "../stores/sessionStore";
import { connectSocket, disconnectSocket, setLocation } from "../utils/sockets";


export function GameScreen({ setScreen }: { setScreen: ScreenHandler }) {
  const { position } = useLocation();

  const username = useUserStore((state) => state.username);
  const userId = useUserStore((state) => state.userId);

  const fetchNodes = useNodeStore((state) => state.fetchNodes);

  if (!username) {
    console.error("Username not valid while GameScreen is active");
    setScreen("login");
  }

  useEffect(() => {
    console.warn("Calling connectSocket")
    connectSocket();
    return () => {
      console.warn("Calling disconnectSocket in cleanup")
      disconnectSocket();
    }
  }, []);

  // Update stored position when position changes
  useEffect(() => {
    // Don't update if it wasn't null and is now?
    // console.warn("position update triggered useEffect");
    if (!position) {
      console.warn("\t!position. skipping");
      return;
    }
    // console.log("\tcalling setLocation");
    setLocation(position);
  }, [position]);

  // Fetch nodes when position changes (this effectively is a timer)
  useEffect(() => {
    fetchNodes(position);
  }, [position, fetchNodes]);

  if (!position) {
    return <h2 className="text-xl font-bold m-2">Locating Position...</h2>;
  }

  return (
    <>
      <div className="flex flex-row gap-1 m-1">
        <GenRandomNodeButton />
        <LogoutButton setScreen={setScreen} />
        {/* User label for development */}
        <p className="p-1 text-zinc-400">
          User: {username ? username : "No user"} ({userId ? userId : "No id"})
        </p>
      </div>
      <GameMap />
    </>
  );
}
