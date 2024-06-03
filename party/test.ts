import type { OpenAIMessage } from "./openai";

export const TEST_INSTRUCTION =
  "turn the light on in the office according to whether there is daylight";

export const TEST_TRANSCRIPT: OpenAIMessage[] = [
  {
    role: "assistant",
    content:
      "I have decided to call the function askUser because: First, I need to determine the current level of natural daylight outside to decide whether the office light needs to be turned on.",
  },
  {
    role: "assistant",
    content: null,
    tool_calls: [
      {
        id: "call_u5DlhskWvxPwwleVEdNwN9Hw",
        type: "function",
        function: {
          name: "askUser",
          arguments: '{"question":"Is there daylight outside right now?"}',
        },
      },
    ],
  },
  {
    tool_call_id: "call_u5DlhskWvxPwwleVEdNwN9Hw",
    role: "tool",
    name: "askUser",
    content: '{"success":"yes"}',
  },
  {
    role: "assistant",
    content:
      "I have decided to call the function halt because: Since there is daylight outside, turning on the light in the office is unnecessary. Therefore, no action is needed regarding the office light.",
  },
  {
    role: "assistant",
    content: null,
    tool_calls: [
      {
        id: "call_5UPNleP3KWh21VM7Kpj7UrfI",
        type: "function",
        function: {
          name: "halt",
          arguments:
            '{"messageToUser":"No need to turn on the office light since there\'s daylight outside."}',
        },
      },
    ],
  },
];
