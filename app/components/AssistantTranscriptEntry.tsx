import type { OpenAIMessage } from "../../party/openai";

export default function AssistantTranscriptEntry({
  entry,
}: {
  entry: OpenAIMessage;
}) {
  return (
    <div
      style={{
        width: "100%",
        borderRadius: "0.25rem",
        border: "1px solid #cfc",
        padding: "0.5rem",
        display: "flex",
        flexDirection: "column",
        gap: "0.5rem",
        justifyItems: "start",
        alignItems: "start",
      }}
    >
      <div
        style={{
          border: "1px solid #999",
          borderRadius: "9999px",
          padding: "0.25rem 0.5rem",
        }}
      >
        {entry.role}
      </div>
      <pre
        style={{
          overflowX: "auto",
          whiteSpace: "pre-wrap",
          wordWrap: "break-word",
        }}
      >
        {JSON.stringify(entry, null, 2)}
      </pre>
    </div>
  );
}
