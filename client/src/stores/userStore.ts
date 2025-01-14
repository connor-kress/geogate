import { create } from 'zustand';

type UserStoreState = {
  username: string | null,
  userId: number | null,
  setUsername: (username: string | null) => void,
  setUserId: (userId: number | null) => void,
  reset: () => void,
};

export const useUserStore = create<UserStoreState>((set) => ({
  username: null,
  userId: null,
  setUsername: (username: string | null) => set({ username }),
  setUserId: (userId: number | null) => set({ userId }),
  reset: () => set({ username: null, userId: null }),
}));
