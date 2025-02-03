import { Pressable, Text } from "react-native";
import { useUserStore } from "../stores/userStore";
import { ScreenHandler } from "../types";
import { config } from "../utils/config";

export function LogoutButton({ setScreen }: { setScreen: ScreenHandler }) {
  const resetUser = useUserStore((store) => store.reset);

  async function handleLogout() {
    try {
      const url = `${config.apiBaseUrl}/auth/logout`;
      const response = await fetch(url, {
        method: "POST",
        credentials: "include", // Include session_token cookie
      });
      if (!response.ok) {
        throw new Error("Logout failed");
      }
      // Reset app state
      resetUser();
      setScreen("login");
      console.log("Logged out successfully");
    } catch (err) {
      console.error("Logout error:", err);
    }
  }

  return (
    <Pressable
      className="bg-zinc-600 px-4 py-1 rounded active:bg-zinc-500"
      onPress={handleLogout}
    >
      <Text className="text-white">Logout</Text>
    </Pressable>
  );
}
