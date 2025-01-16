import { create } from 'zustand';
import { ResourceNode } from '../types';

type NodeStoreState = {
  nodes: ResourceNode[],
  isLoading: boolean,
  error: Error | null,
  setNodes: (nodes: ResourceNode[]) => void,
  setIsLoading: (isLoading: boolean) => void,
  setError: (error: Error | null) => void,
};

export const useNodeStore = create<NodeStoreState>((set) => ({
  nodes: [],
  isLoading: false,
  error: null,
  setNodes: (nodes: ResourceNode[]) => set({ nodes }),
  setIsLoading: (isLoading: boolean) => set({ isLoading }),
  setError: (error: Error | null) => set({ error }),
}));
