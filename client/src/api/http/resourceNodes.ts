import { useUserStore } from "../../stores/userStore";
import { Coords, NodeType, ResourceNode } from "../../types";
import { config } from "../../utils/config";

export async function fetchResourceNodes(): Promise<ResourceNode[] | null> {
  const { userId } = useUserStore.getState();
  const url = `${config.apiBaseUrl}/nodes?user_id=${userId}`;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch resource nodes: ${response.statusText}`);
    }
    const data: ResourceNode[] = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching resource nodes:", error);
    return null;
  }
};

export async function insertResourceNode(
  coords: Coords, nodeType: NodeType
): Promise<number | null> {
  const { userId } = useUserStore.getState();

  const url = `${config.apiBaseUrl}/nodes`;
  const body = JSON.stringify({ userId, coords, nodeType });
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body,
    });
    if (!response.ok) {
      throw new Error(`Failed to insert resource node: ${response.statusText}`);
    }
    const data: { id: number } = await response.json();
    return data.id;
  } catch (error) {
    console.error("Error inserting resource node:", error);
    return null;
  }
}
