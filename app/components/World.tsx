import { useState } from "react";
import usePartySocket from "partysocket/react";
import type { World } from "../../party/world";

export default function World() {
  const [world, setWorld] = useState<World | null>(null);

  const socket = usePartySocket({
    room: "default",
    onMessage: (evt) => {
      const data = JSON.parse(evt.data);
      if (data.type === "sync") {
        setWorld(data.state);
      }
    },
  });

  return (
    <div>
      <h2>World</h2>
      <pre>{JSON.stringify(world, null, 2)}</pre>
    </div>
  );
}
