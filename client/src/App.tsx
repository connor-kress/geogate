import { useState } from "react";
import { Screen } from "./types";
// import { GameScreen } from "./screens/GameScreen";
import { LoginScreen } from "./screens/LoginScreen";
// import { RegisterScreen } from "./screens/RegisterScreen";
import { Text, View } from 'react-native';
import "../global.css"

export default function App() {
  const [screen, setScreen] = useState<Screen>("login");

  return (
    <View className="bg-zinc-700 min-h-screen w-full flex flex-col justify-center items-center">
      {screen === "login" && <LoginScreen setScreen={setScreen} />}
      {screen === "register" && <Text>Register Screen</Text>}
      {screen === "game" && <Text>Game Screen</Text>}
    </View>
  );
}
