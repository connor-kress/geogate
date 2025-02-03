import { useState } from "react";
import {
  ActivityIndicator,
  GestureResponderEvent,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import { ScreenHandler } from "../types";
import { config } from "../utils/config";

type RegisterFormData = {
  username: string,
  password: string,
  // email: string,  // add email validation
}

export function RegisterScreen({ setScreen }: { setScreen: ScreenHandler }) {
  const [formData, setFormData] = useState<RegisterFormData>({
    username: "",
    password: ""
  });
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: GestureResponderEvent) {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    const url = `${config.apiBaseUrl}/auth/register`;
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Registration failed");
      }
      setScreen("login");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View className="items-center gap-2 p-4">
      <Text className="text-lg font-bold text-white">Register:</Text>

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
        {isLoading ? <ActivityIndicator color="white" /> : <Text className="text-white">Create</Text>}
      </Pressable>

      <Pressable onPress={() => setScreen("login")}>
        <Text className="text-sm text-zinc-400 hover:text-zinc-300">
          Back to login
        </Text>
      </Pressable>
    </View>
  );
}
