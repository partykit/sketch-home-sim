import type { Location, MoveableItem } from "../../party/world";

export default function DebugLocation({
  location,
  moveableItems,
}: {
  location: Location;
  moveableItems: MoveableItem[];
}) {
  // Make list of all items in location with type 'light'
  const lights = location.contents.filter((item) => item.type === "light");
  // Do any of the lights have state.on === true?
  const isLit = lights.some((light) => light.state.on);

  return (
    <div
      style={{
        width: "100%",
        maxWidth: "12rem",
        border: "1px solid #666",
        borderRadius: "0.25rem",
        padding: "0.5rem",
        background: isLit ? "#ffc" : "#cce",
      }}
    >
      <h2>
        {location.name} <code>&lt;{location.id}&gt;</code>
      </h2>
      <h4>Contents</h4>
      {location.contents.map((item) => (
        <p key={item.id}>
          <strong>{item.name}</strong> <code>&lt;{item.id}&gt;</code>
          <br />
          type: <code>{item.type}</code>
          <br />
          state: <code>{JSON.stringify(item.state)}</code>
        </p>
      ))}
      <p>
        <strong>Exits:</strong>
        {location.exits.map((exit) => (
          <span key={exit}>
            {" "}
            <code>&lt;{exit}&gt;</code>
          </span>
        ))}
      </p>
      {moveableItems.length > 0 && (
        <>
          <h4>Also here</h4>
          <ul>
            {moveableItems.map((item) => (
              <li key={item.id}>
                <strong style={{ background: "white" }}>{item.name}</strong>{" "}
                <code>&lt;{item.id}&gt;</code>
                <br />
                type: <code>{item.type}</code>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
