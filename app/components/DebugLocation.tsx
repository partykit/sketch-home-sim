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
        border: "0px solid #666",
        borderRadius: "0.25rem",
        padding: "0.5rem",
        background: isLit ? "#fde68a" : "#c7d2fe",
        transition: "background-color 0.5s",
      }}
    >
      <h2>
        {location.name} <code>&lt;{location.id}&gt;</code>
      </h2>
      <div
        style={{
          textTransform: "uppercase",
          fontSize: "0.8rem",
          fontWeight: "bold",
        }}
      >
        Devices
      </div>
      {location.contents.map((item) => (
        <div key={item.id}>
          <strong>{item.name}</strong> <code>&lt;{item.id}&gt;</code>
          <br />
          type: <code>{item.type}</code>
          <br />
          state: <code>{JSON.stringify(item.state)}</code>
        </div>
      ))}

      <div
        style={{
          textTransform: "uppercase",
          fontSize: "0.8rem",
          fontWeight: "bold",
          marginTop: "1rem",
        }}
      >
        Exits
      </div>
      <div>
        {location.exits.map((exit) => (
          <span key={exit}>
            {" "}
            <code>&lt;{exit}&gt;</code>
          </span>
        ))}
      </div>
      {moveableItems.length > 0 && (
        <>
          <div
            style={{
              textTransform: "uppercase",
              fontSize: "0.8rem",
              fontWeight: "bold",
              marginTop: "1rem",
            }}
          >
            Also here
          </div>

          <ul style={{ marginTop: "0.25rem" }}>
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
