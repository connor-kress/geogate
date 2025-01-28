import { StatusBar } from 'expo-status-bar';
import { Button, Text, View } from 'react-native';
import "../global.css"

export default function App() {
  return (
    <View className="bg-zinc-700 min-h-screen w-full flex flex-col justify-center items-center gap-2">
      <Text className="text-red-500 text-lg">This is the hole app :(</Text>
      <StatusBar style="auto" />
      <Button
        title="I am a button"
        onPress={() => console.log("What the button?")}
      />
    </View>
  );
}
