import itemTypesData from "../../../shared/item_types.json";
import { ItemTypeMetadata } from "../types";

// Type validation needed
const itemTypes: ItemTypeMetadata[] = itemTypesData;

// Map for quick lookup of item metadata by name
export const ITEM_TYPE_MAP: Record<string, ItemTypeMetadata> = itemTypes.reduce(
  (map, item) => {
    map[item.name] = item;
    return map;
  },
  {} as Record<string, ItemTypeMetadata>
);
