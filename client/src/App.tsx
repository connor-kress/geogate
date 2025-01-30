import { useState } from "react";
import { View } from 'react-native';
import { GameScreen } from "./screens/GameScreen";
import { LoginScreen } from "./screens/LoginScreen";
import { RegisterScreen } from "./screens/RegisterScreen";
import { Screen } from "./types";
import "../global.css"

export default function App() {
  const [screen, setScreen] = useState<Screen>("login");

  return (
    <View className="bg-zinc-700 min-h-screen w-full justify-center items-center">
      {screen === "login" && <LoginScreen setScreen={setScreen} />}
      {screen === "register" && <RegisterScreen setScreen={setScreen} />}
      {screen === "game" && <GameScreen setScreen={setScreen} />}
    </View>
  );
}
