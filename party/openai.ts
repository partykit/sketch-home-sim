import OpenAI from "openai";

export type OpenAIMessage = OpenAI.Chat.Completions.ChatCompletionMessageParam;

export async function getChatCompletionResponse({
  messages,
  tool,
}: {
  messages: OpenAIMessage[];
  tool: any;
}) {
  // If no organization is set, usage will count against the default key owner
  if (!process.env.OPENAI_API_ORGANIZATION) {
    console.info(
      "No OPENAI_API_ORGANIZATION set, usage will count against the default key owner"
    );
  }

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    organization: process.env.OPENAI_API_ORGANIZATION,
  });

  /*const prompt = [
    {
      role: "system",
      content:
        "You are a helpful AI assistant. Your responses are always accurate and extremely brief.",
    } satisfies OpenAIMessage,
    ...messages,
  ];*/

  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages,
    /*tools: tools.map((tool) => {
      return { type: "function", function: tool.getSignature() };
    }),*/
    tools: [{ type: "function", function: tool.getSignature() }],
    tool_choice: { type: "function", function: { name: tool.name } },
  });

  console.log("response", JSON.stringify(response, null, 2));

  // Reply with the first message that includes a tool call
  const toolCallMessage = response.choices.find(
    (choice) => choice.message.tool_calls
  );
  if (toolCallMessage) {
    return toolCallMessage.message as OpenAI.Chat.Completions.ChatCompletionMessage;
  }

  return;

  /*let tool_calls: OpenAI.Chat.Completions.ChatCompletionMessageToolCall[] = [];
  let response_messages: OpenAI.Chat.Completions.ChatCompletionMessage[] = [];
  response.choices.map((choice) => {
    if (choice.message.tool_calls) {
      tool_calls.push(...choice.message.tool_calls);
    }
    if (choice.message.content) {
      response_messages.push(choice.message);
    }
  });

  // Ignore response_messages
  //return { response_messages, tool_calls };
  return tool_calls;*/
}
