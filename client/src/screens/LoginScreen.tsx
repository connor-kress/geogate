import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  GestureResponderEvent,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import { useUserStore } from "../stores/userStore";
import { ScreenHandler, User } from "../types";
import { config } from "../utils/config";

export function LoginScreen({ setScreen }: { setScreen: ScreenHandler }) {
  const [formData, setFormData] = useState({
    username: "",
    password: ""
  });
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  const setUsername = useUserStore((state) => state.setUsername);
  const setUserId = useUserStore((state) => state.setUserId);

  // Check for existing session when component mounts
  useEffect(() => {
    async function checkExistingSession() {
      try {
        const url = `${config.apiBaseUrl}/auth/verify-session`;
        const response = await fetch(url, {
          credentials: "include",  // Includes session_token cookie
        });

        if (response.ok) {
          const data: User = await response.json();  // Add type validation
          console.log("Found existing session:", data);
          setUsername(data.username);
          setUserId(data.id);
          setScreen("game");
        }
      } catch (error) {
        // Session invalid or expired - user needs to log in manually
        console.log("No valid session found");
      }
    }

    checkExistingSession();
  }, [setUsername, setUserId, setScreen]);

  async function handleSubmit(e: GestureResponderEvent) {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      const url = `${config.apiBaseUrl}/auth/login`;
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",  // Important for cookies
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Login failed");
      }
      const responseData = await response.json();
      console.log(responseData);
      if (typeof responseData.userId !== "number") {  // Improve type validation
        throw Error("UserId not in login response");
      }
      // Update user store and switch screens
      console.log("Setting user data:", formData.username, responseData.userId);
      setUsername(formData.username);
      setUserId(responseData.userId);
      setScreen("game");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View className="items-center gap-2 p-4">
      <Text className="text-lg font-bold text-white">Login:</Text>

      {error ? <Text className="text-red-500 text-sm">{error}</Text> : null}

      <TextInput
        placeholder="username"
        value={formData.username}
        onChangeText={(text) => {
          setFormData((prev) => ({ ...prev, username: text }));
        }}
        className="w-64 px-3 py-2 rounded bg-white text-black"
        autoCapitalize="none"
      />
      <TextInput
        placeholder="password"
        value={formData.password}
        onChangeText={(text) => {
          setFormData((prev) => ({ ...prev, password: text }));
        }}
        className="w-64 px-3 py-2 rounded bg-white text-black"
        secureTextEntry
      />

      <Pressable
        onPress={handleSubmit}
        disabled={isLoading}
        className="bg-zinc-600 px-4 py-2 rounded hover:bg-zinc-500 disabled:opacity-50 w-64 flex items-center"
      >
        {isLoading ? <ActivityIndicator color="white" /> : <Text className="text-white">Login</Text>}
      </Pressable>

      <Pressable onPress={() => setScreen("register")}>
        <Text className="text-sm text-zinc-400 hover:text-zinc-300">
          Need an account? Register
        </Text>
      </Pressable>
    </View>
  );
}
