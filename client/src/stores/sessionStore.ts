import { create } from "zustand";
import { Coords } from "../types";
import { WebSocketManager } from "../utils/socketManager";

type SessionStoreState = {
  location: Coords | null,
  socketManager: WebSocketManager | null,
  setLocation: (location: Coords | null) => void,
  setSocketManager: (manager: WebSocketManager | null) => void,
};


export const useSessionStore = create<SessionStoreState>((set) => ({
  location: null,
  socketManager: new WebSocketManager("ws://localhost:8000/session/ws"),
  setLocation: (location: Coords | null) => set({ location }),
  setSocketManager: (manager: WebSocketManager | null) => set({ socketManager: manager }),
}));
