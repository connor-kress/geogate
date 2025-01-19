import { useUserStore } from "../stores/userStore";

export function handleInventory(items: any[]) {
  if (!Array.isArray(items)) {
    console.error("Invalid data format for inventory:", items);
  }
  // Type validation
  const { setInventory } = useUserStore.getState();
  setInventory(items);
}
