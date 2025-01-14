import { create } from "zustand";
import { Coords } from "../types";

type SessionStoreState = {
  location: Coords | null;
  socket: WebSocket | null;
  setLocation: (newLocation: Coords) => void;
  connectSocket: () => void;
  disconnectSocket: () => void;
};

export const useSessionStore = create<SessionStoreState>((set, get) => ({
  location: null, // User's current location
  socket: null, // WebSocket instance

  setLocation: (newLocation: Coords) => {
    set({ location: newLocation });
    const socket = get().socket;
    if (socket && socket.readyState === WebSocket.OPEN) {
      const message = { location: newLocation };
      socket.send(JSON.stringify(message));
    } else {
      console.warn("WebSocket is not open. Location not sent.");
      get().connectSocket();
    }
  },

  connectSocket: () => {
    const socketUrl = "ws://localhost:8000/session/ws";
    const socket = new WebSocket(socketUrl);
    socket.onopen = () => {
      console.log("WebSocket connected");
    };
    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log("Message received from server:", data);
      // Handle incoming messages
    };
    socket.onclose = (event) => {
      console.log(
        `WebSocket disconnected: code=${event.code}, reason=${event.reason}`);
      set({ socket: null });
    };
    socket.onerror = (err) => {
      console.error("WebSocket error:", err);
      socket.close();
    }
    set({ socket });
  },

  disconnectSocket: () => {
    set((state) => {
      if (state.socket) {
        state.socket.close(1000, "User disconnected");
      }
      return { socket: null };
    });
  },
}));
