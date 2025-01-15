import { GameMap } from "../components/GameMap";
import { GenRandomNodeButton } from "../components/GenRandomNodeButton";
import { useUserStore } from "../stores/userStore";
import { ScreenHandler } from "../types";
import { LogoutButton } from "../components/LogoutButton";
import { useSessionStore } from "../stores/sessionStore";
import { useSessionConnection } from "../hooks/useSessionConnection";
import { WebSocketIndicator } from "../components/WebSocketIndicator";


export function GameScreen({ setScreen }: { setScreen: ScreenHandler }) {
  useSessionConnection();

  const username = useUserStore((state) => state.username);
  const userId = useUserStore((state) => state.userId);
  const position = useSessionStore((state) => state.location);

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
        <WebSocketIndicator />
      </div>
      <GameMap />
    </>
  );
}
