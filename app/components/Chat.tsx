import styles from "./Chat.module.css";
import type { OpenAIMessage } from "../../party/openai";
import { useState } from "react";
import usePartySocket from "partysocket/react";

// Another example is:
// tell me where my dog is. you'll know it's my dog when you see it
const DEFAULT_INSTRUCTION = "turn on the light in the lounge";

/* IN PROGRESS: Alternate chat view */

export default function Chat() {
  const [assistant, setAssistant] = useState<any>(null);
  const [input, setInput] = useState<string>(DEFAULT_INSTRUCTION);

  const socket = usePartySocket({
    party: "assistant",
    room: "default",
    onMessage: (evt) => {
      const data = JSON.parse(evt.data);
      if (data.type === "sync") {
        setAssistant(data.state);
      } else if (data.type === "askUser") {
        socket.send(
          JSON.stringify({
            type: "askUserResponse",
            toolCallId: data.toolCallId,
            answer: prompt(data.question),
          })
        );
      }
    },
  });

  const transcript = [
    ...(assistant?.instruction
      ? [{ role: "user", content: assistant.instruction } as OpenAIMessage]
      : []),
    ...(assistant?.transcript || []),
  ];

  return (
    <div
      style={{
        display: "flex",
        width: "100%",
        flexDirection: "column-reverse",
        justifyContent: "end",
        alignContent: "start",
        gap: "1rem",
        backgroundColor: "red",
        fontSize: "1.2rem",
      }}
    >
      <form
        style={{
          display: "flex",
          justifyContent: "stretch",
          gap: "0.5rem",
          width: "100%",
        }}
      >
        <input
          type="text"
          name="instruction"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          style={{ flex: 1 }}
        />
        <button type="submit">Send</button>
      </form>
      {transcript.map((entry: OpenAIMessage, index: number) => {
        if (entry.role === "user") {
          return (
            <div
              key={index}
              className={`${styles.listItem} ${styles.reversed}`}
            >
              <div className={styles.user}>You</div>
              <div className={styles.message}>{entry.content as string}</div>
            </div>
          );
        } else {
          return <div key={index}>{JSON.stringify(entry, null, 2)}</div>;
        }
      })}
    </div>
  );
}
