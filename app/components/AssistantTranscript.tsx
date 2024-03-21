import { useRef, useEffect } from "react";
import type { OpenAIMessage } from "../../party/openai";
import AssistantTranscriptEntry from "./AssistantTranscriptEntry";

export default function AssistantTranscript({
  transcript,
}: {
  transcript: OpenAIMessage[];
}) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column-reverse",
        gap: "0.5rem",
        width: "100%",
      }}
    >
      {transcript.map((entry: any, index: number) => (
        <AssistantTranscriptEntry
          key={`entry-${index}`}
          entry={entry}
          index={index}
        />
      ))}
    </div>
  );
}
