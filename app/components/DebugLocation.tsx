import type { Location } from "../../party/world";

export default function DebugLocation({ location }: { location: Location }) {
  return (
    <div
      style={{
        width: "100%",
        maxWidth: "14rem",
        border: "1px solid #666",
        borderRadius: "0.25rem",
        padding: "0.5rem",
      }}
    >
      <h2>{location.name}</h2>
      <p>
        ID: <code>&lt;{location.id}&gt;</code>
      </p>
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
      <h4>Exits</h4>
      <ul>
        {location.exits.map((exit) => (
          <li key={exit}>
            <code>&lt;{exit}&gt;</code>
          </li>
        ))}
      </ul>
    </div>
  );
}
