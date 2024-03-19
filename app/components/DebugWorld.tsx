import type { World } from "../../party/world";

export default function DebugWorld({ world }: { world: World | null }) {
  return (
    <div>
      <h2>World</h2>
      <pre>{JSON.stringify(world, null, 2)}</pre>
    </div>
  );
}
