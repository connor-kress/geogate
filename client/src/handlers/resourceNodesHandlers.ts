import { useNodeStore } from "../stores/nodeStore";

export function handleResourceNodes(nodes: any[]) {
  if (!Array.isArray(nodes)) {
    console.error("Invalid data format for resource_nodes:", nodes);
  }
  // Type validation
  const { setNodes } = useNodeStore.getState();
  setNodes(nodes);
}

export function handleCollectResourceNodeError(errorMessage: string) {
  console.error(
    "Error while attempting to collect resource node:",
    errorMessage,
  );
}
