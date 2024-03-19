import { useState } from "react";
import usePartySocket from "partysocket/react";

// Another example is:
// tell me where my dog is. you'll know it's my dog when you see it
const DEFAULT_INSTRUCTION = "turn on the light in the lounge";

export default function Debug() {
  const [assistant, setAssistant] = useState<any>(null);
  const [input, setInput] = useState<string>(DEFAULT_INSTRUCTION);

  const socket = usePartySocket({
    party: "assistant",
    room: "default",
    onMessage: (evt) => {
      const data = JSON.parse(evt.data);
      if (data.type === "sync") {
        setAssistant(data.state);
      }
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    socket.send(JSON.stringify({ type: "instruct", instruction: input }));
    setInput("");
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "2rem",
      }}
    >
      <h1>Assistant</h1>
      <form
        onSubmit={handleSubmit}
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
        <button type="submit">Instruct</button>
      </form>
      <div>
        <h2>Assistant State</h2>
        <pre
          style={{
            overflowX: "auto",
            whiteSpace: "pre-wrap",
            wordWrap: "break-word",
          }}
        >
          {JSON.stringify(assistant, null, 2)}
        </pre>
      </div>
    </div>
  );
}
