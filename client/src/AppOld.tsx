import { useState } from "react";
import { Screen } from "./types";
import { GameScreen } from "./screens/GameScreen";
import { LoginScreen } from "./screens/LoginScreen";
import { RegisterScreen } from "./screens/RegisterScreen";

export default function App() {
  const [screen, setScreen] = useState<Screen>("login");

  return (
    <div className="bg-zinc-700 h-screen">
      {screen === "login" && <LoginScreen setScreen={setScreen} />}
      {screen === "register" && <RegisterScreen setScreen={setScreen} />}
      {screen === "game" && <GameScreen setScreen={setScreen} />}
    </div>
  );
}
