import { create } from "zustand";
import { Coords } from "../types";

type SessionStoreState = {
  location: Coords | null,
  socket: WebSocket | null,
  setLocation: (location: Coords | null) => void,
  setSocket: (socket: WebSocket | null) => void,
};

export const useSessionStore = create<SessionStoreState>((set) => ({
  location: null, // User's current location
  socket: null, // WebSocket instance
  setLocation: (location: Coords | null) => set({ location }),
  setSocket: (socket: WebSocket | null) => set({ socket }),
  // Add isConnected util for dev
}));
