import { useState } from "react";
import usePartySocket from "partysocket/react";
import DebugWorld from "./DebugWorld";
import DebugFunctions from "./DebugFunctions";
import type { World } from "../../party/world";

const DEFAULT_ROOM = "default";

export default function Debug() {
  const [world, setWorld] = useState<World | null>(null);

  const socket = usePartySocket({
    room: DEFAULT_ROOM,
    onMessage: (evt) => {
      const data = JSON.parse(evt.data);
      if (data.type === "sync") {
        setWorld(data.state);
      }
    },
  });

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "2rem",
        backgroundColor: "#eee",
      }}
    >
      <h1>World</h1>
      <DebugWorld world={world} />
      <DebugFunctions host={socket.host} room={DEFAULT_ROOM} />
    </div>
  );
}
