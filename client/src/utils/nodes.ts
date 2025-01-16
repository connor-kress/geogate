import { fetchResourceNodes } from "../queries";
import { useNodeStore } from "../stores/nodeStore";

export async function fetchAndStoreResourceNodes() {
  const { setNodes, setIsLoading, setError } = useNodeStore.getState();

  setIsLoading(true);
  setError(null);

  try {
    const newNodes = await fetchResourceNodes();
    setNodes(newNodes || []);
  } catch (err) {
    console.error('Error fetching resource nodes:', err);
    setError(err instanceof Error ? err : new Error('Failed to fetch nodes'));
    setNodes([]);
  } finally {
    setIsLoading(false);
  }
};
