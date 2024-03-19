import type { World } from "../../party/world";
import DebugLocation from "./DebugLocation";
export default function DebugWorld({ world }: { world: World | null }) {
  return (
    <div>
      <h2>World</h2>
      <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
        {world?.locations.map((location) => (
          <DebugLocation key={location.id} location={location} />
        ))}
      </div>
      <pre>{JSON.stringify(world?.moveableItems, null, 2)}</pre>
    </div>
  );
}
