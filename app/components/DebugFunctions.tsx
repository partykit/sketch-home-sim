import { useState } from "react";
import PartySocket from "partysocket";

const DEBUG_LIGHTS = [
  "lounge-light",
  "hallway-light",
  "kitchen-light",
  "bedroom-light",
  "office-light",
];

const DEBUG_ROOMS = ["lounge", "hallway", "kitchen", "bedroom", "office"];

export default function DebugFunctions({
  host,
  room,
}: {
  host: string;
  room: string;
}) {
  const [response, setResponse] = useState<string | null>(null);

  const fetch = async (fn: string, args: any) => {
    const res = await PartySocket.fetch(
      { host, room, path: "call" },
      { method: "POST", body: JSON.stringify({ fn, args }) }
    );
    setResponse(await res.text());
  };

  const handleToggleLightSubmit = (evt: React.FormEvent<HTMLFormElement>) => {
    evt.preventDefault();
    const light = evt.currentTarget.elements.namedItem(
      "light"
    ) as HTMLSelectElement;
    fetch("toggleLight", { lightId: light.value });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <h2>Functions</h2>
      <form
        onSubmit={handleToggleLightSubmit}
        style={{ display: "flex", gap: "0.5rem" }}
      >
        <select name="light">
          {DEBUG_LIGHTS.map((light) => (
            <option key={light} value={light}>
              {light}
            </option>
          ))}
        </select>
        <button type="submit">toggleLight</button>
      </form>
      <form>
        <button onClick={() => {} /* @TODO */}>lookWithRobot</button>
      </form>
      <form style={{ display: "flex", gap: "0.5rem" }}>
        <select name="room">
          {DEBUG_ROOMS.map((room) => (
            <option key={room} value={room}>
              {room}
            </option>
          ))}
        </select>
        <button onClick={() => {} /* @TODO */}>moveRobot</button>
      </form>
      <div>Latest response: {response ? <pre>{response}</pre> : "None"}</div>
    </div>
  );
}
