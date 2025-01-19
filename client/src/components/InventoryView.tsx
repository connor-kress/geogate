import { useUserStore } from "../stores/userStore";
import { ITEM_TYPE_MAP } from "../utils/items";

export function InventoryView() {
  const items = useUserStore((state) => state.inventory);

  return (
    <div className="p-4 bg-zinc-800 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-zinc-100 mb-4">Inventory</h2>
      {items === null ? (
        <p>Loading...</p>
      ) : (
        <ul className="space-y-2">
          {items.map((item) => (
            <li
              key={item.id}
              className="flex justify-between items-center p-2 bg-zinc-700 rounded-lg hover:bg-zinc-600 transition"
            >
              <span className="text-zinc-200 font-medium">{
                ITEM_TYPE_MAP[item.itemType].displayName
              }</span>
              <span className="text-zinc-400">
                {item.itemCount !== null ? item.itemCount : "N/A"}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
