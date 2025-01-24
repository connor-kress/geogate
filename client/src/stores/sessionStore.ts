import { create } from "zustand";
import { Coords } from "../types";
import { WebSocketManager } from "../utils/socketManager";

type SessionStoreState = {
  location: Coords | null,
  socketManager: WebSocketManager | null,
  readyState: number | null,
  setLocation: (location: Coords | null) => void,
  setSocketManager: (manager: WebSocketManager | null) => void,
  setReadyState: (readyState: number | null) => void,
};

export const useSessionStore = create<SessionStoreState>((set, get) => ({
  location: null,
  socketManager: WebSocketManager.getInstance(
    "ws://localhost:8000/session/ws",
    (readyState: number | null) => set({ readyState }),
    () => get().readyState,
  ),
  readyState: null,
  setLocation: (location: Coords | null) => set({ location }),
  setSocketManager: (manager: WebSocketManager | null) => set({ socketManager: manager }),
  setReadyState: (readyState: number | null) => set({ readyState }),
}));
