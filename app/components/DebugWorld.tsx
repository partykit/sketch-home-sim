import type { World } from "../../party/world";
import DebugLocation from "./DebugLocation";
export default function DebugWorld({ world }: { world: World | null }) {
  return (
    <div>
      <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
        {world?.locations.map((location) => (
          <DebugLocation
            key={location.id}
            location={location}
            moveableItems={world?.moveableItems.filter(
              (item) => item.location === location.id
            )}
          />
        ))}
      </div>
      <details style={{ display: "none" }}>
        <summary>Debug</summary>
        <pre>{JSON.stringify(world, null, 2)}</pre>
      </details>
    </div>
  );
}
