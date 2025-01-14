import { create } from 'zustand';
import { Coords, ResourceNode } from '../types';
import { fetchResourceNodes } from '../queries';

type NodeStoreState = {
  nodes: ResourceNode[],
  isLoading: boolean,
  error: Error | null,
  fetchNodes: (userPos: Coords | null) => Promise<void>,
  clearNodes: () => void,
};

export const useNodeStore = create<NodeStoreState>((set) => ({
  nodes: [],
  isLoading: false,
  error: null,
  fetchNodes: async (userPos: Coords | null) => {
    if (!userPos) return;

    set({ isLoading: true, error: null });
    try {
      // console.log(`Fetching coords ${userPos.lat}, ${userPos.lon}`);
      const newNodes = await fetchResourceNodes(userPos);
      set({ nodes: newNodes || [] });
    } catch (err) {
      console.error('Error fetching resource nodes:', err);
      set({
        error: err instanceof Error ? err : new Error('Failed to fetch nodes'),
        nodes: [],
      });
    } finally {
      set({ isLoading: false });
    }
  },
  clearNodes: () => set({ nodes: [] }),
}));
