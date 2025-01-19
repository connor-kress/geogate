import { create } from 'zustand';
import { Item } from '../types';

type UserStoreState = {
  username: string | null,
  userId: number | null,
  inventory: Item[] | null,
  setUsername: (username: string | null) => void,
  setUserId: (userId: number | null) => void,
  setInventory: (inventory: Item[] | null) => void,
  reset: () => void,
};

export const useUserStore = create<UserStoreState>((set) => ({
  username: null,
  userId: null,
  inventory: null,
  setUsername: (username: string | null) => set({ username }),
  setUserId: (userId: number | null) => set({ userId }),
  setInventory: (inventory: Item[] | null) => set({ inventory }),
  reset: () => set({ username: null, userId: null, inventory: null }),
}));
