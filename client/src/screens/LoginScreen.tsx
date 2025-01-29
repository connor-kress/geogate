import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  GestureResponderEvent,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
// import { useUserStore } from "../store/userStore";
import { ScreenHandler, User } from "../types";

export function LoginScreen({ setScreen }: { setScreen: ScreenHandler }) {
  const [formData, setFormData] = useState({
    username: "",
    password: ""
  });
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  // const setUsername = useUserStore((state) => state.setUsername);
  // const setUserId = useUserStore((state) => state.setUserId);

  // Check for existing session when component mounts
  useEffect(() => {
    async function checkExistingSession() {
      try {
        const response = await fetch("http://localhost:8000/auth/verify-session", {
          credentials: "include",  // Includes session_token cookie
        });

        if (response.ok) {
          const data: User = await response.json();  // Add type validation
          console.log("Setting user data:", data);
          // setUsername(data.username);
          // setUserId(data.id);
          setScreen("game");
          console.log("Existing session found:", data);
        }
      } catch (error) {
        // Session invalid or expired - user needs to log in manually
        console.log("No valid session found");
      }
    }

    checkExistingSession();
  }, [/* setUsername, setUserId */, setScreen]);

  async function handleSubmit(e: GestureResponderEvent) {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      const response = await fetch("http://localhost:8000/auth/login", {
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
      // setUsername(formData.username);
      // setUserId(responseData.userId);
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

      <TouchableOpacity
        onPress={handleSubmit}
        disabled={isLoading}
        className="bg-zinc-600 px-4 py-2 rounded hover:bg-zinc-500 disabled:opacity-50 w-64 flex items-center"
      >
        {isLoading ? <ActivityIndicator color="white" /> : <Text className="text-white">Login</Text>}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => setScreen("register")}>
        <Text className="text-sm text-zinc-400 hover:text-zinc-300">
          Need an account? Register
        </Text>
      </TouchableOpacity>
    </View>
  );
}
