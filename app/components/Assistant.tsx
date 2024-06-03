import { useState } from "react";
import usePartySocket from "partysocket/react";
import AssistantTranscript from "./AssistantTranscript";

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

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    socket.send(JSON.stringify({ type: "instruct", instruction: input }));
    setInput("");
  };

  // If the final message in the assistant.transcript...
  // - has .role === assistant
  // - has .tool_calls
  // - has .tool_calls[0].function.name === "halt"
  // then the assistant has finished its task. So parse:
  // `.tool_calls[0].function.arguments` and get the value of 'messageToUser'
  let messageToUser = null;
  if (
    assistant && // if assistant is not null
    assistant.transcript && // if assistant.transcript is not null
    assistant.transcript.length > 0
  ) {
    const last = assistant.transcript[assistant.transcript.length - 1];
    if (
      last.role === "assistant" &&
      last.tool_calls &&
      last.tool_calls[0].function.name === "halt"
    ) {
      const payload = JSON.parse(last.tool_calls[0].function.arguments);
      messageToUser = payload.messageToUser;
    }
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "stretch",
        gap: "2rem",
        backgroundColor: "#fff",
      }}
    >
      <h1>Agent</h1>
      {!assistant?.instruction && (
        <>
          <form
            onSubmit={handleSubmit}
            style={{
              display: "flex",
              justifyContent: "stretch",
              gap: "0.5rem",
              width: "100%",
              fontSize: "1.25rem",
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
            <h2>Try these examples</h2>
            <ul>
              <li>turn on the light in the kitchen</li>
              <li>turn off all the lights</li>
              <li>turn on the light for sally</li>
              <li>find my dog</li>
              <li>turn the lights in the office to something appropriate</li>
            </ul>
          </div>
        </>
      )}
      {assistant?.instruction && (
        <>
          <div
            style={{
              fontSize: "1.25rem",
              backgroundColor: "#eee",
              padding: "1rem",
              display: "flex",
              flexDirection: "column",
              justifyContent: "start",
              alignItems: "start",
              gap: "0.5rem",
            }}
          >
            <div>
              <strong>User</strong>
              <br />
              {assistant.instruction}
            </div>
            <div>
              <strong>Agent</strong>
              <br />
              {messageToUser !== null ? (
                <span style={{ backgroundColor: "#86efac" }}>
                  {messageToUser}
                </span>
              ) : (
                <span>
                  <i>Working...</i>
                </span>
              )}
            </div>
            {messageToUser && (
              <div>
                <a
                  href="#"
                  style={{
                    color: "#666",
                    textDecoration: "underline",
                    fontSize: "1rem",
                  }}
                  onClick={() => setAssistant(null)}
                >
                  Reset
                </a>
              </div>
            )}
          </div>
          <div style={{ flexGrow: 1 }}>
            <h2>Activity</h2>
            <p>
              <strong>Tool calls remaining before cut-off:</strong>{" "}
              {assistant.remaining}
            </p>
            <AssistantTranscript transcript={assistant.transcript} />
          </div>
          <details>
            <summary
              style={{
                fontSize: "1rem",
                marginBottom: "1rem",
                opacity: 0.5,
              }}
            >
              Transcript [debug]
            </summary>
            <pre
              style={{
                fontSize: "0.85rem",
                whiteSpace: "pre-wrap",
                wordWrap: "break-word",
              }}
            >
              {JSON.stringify(assistant.transcript, null, 2)}
            </pre>
          </details>
        </>
      )}
    </div>
  );
}
