import { useNodeStore } from "../stores/nodeStore";

export function handleResourceNodes(nodes: any[]) {
  if (!Array.isArray(nodes)) {
    console.error("Invalid data format for resource_nodes:", nodes);
  }
  // Type validation
  const { setNodes } = useNodeStore.getState();
  setNodes(nodes);
}
