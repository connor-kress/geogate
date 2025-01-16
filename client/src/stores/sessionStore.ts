import { create } from "zustand";
import { Coords } from "../types";

type SessionStoreState = {
  location: Coords | null,
  socket: WebSocket | null,
  connecting: boolean,
  setLocation: (location: Coords | null) => void,
  setSocket: (socket: WebSocket | null) => void,
  setConnecting: (connecting: boolean) => void,
};

export const useSessionStore = create<SessionStoreState>((set) => ({
  location: null, // User's current location
  socket: null, // WebSocket instance
  connecting: false,
  setLocation: (location: Coords | null) => set({ location }),
  setSocket: (socket: WebSocket | null) => set({ socket }),
  setConnecting: (connecting: boolean) => set({ connecting }),
}));
