import type * as Party from "partykit/server";
import { intentFunction, allFunctions } from "./functions";
import { getChatCompletionResponse } from "./openai";
import type { OpenAIMessage } from "./openai";

export default class AssistantServer implements Party.Server {
  constructor(readonly room: Party.Room) {}

  onConnect(conn: Party.Connection, ctx: Party.ConnectionContext) {
    // no-op
  }

  async onRequest(req: Party.Request) {
    if (req.method === "GET") {
      return Response.json(this.fn.getSignature());
    } else if (req.method === "POST") {
      const body: { question: string } = await req.json();

      const messages = [
        {
          role: "system",
          content:
            "You are a helpful AI assistant. You respond only using function calls, NEVER messages (call the appropriate function instead). You will be asked a question as part of a long conversation between human users. You are provided with the unstructured conversation transcript as reference. The question may refer to the transcript, or it may be about something else. You will be given the conversation transcript first, with the question to follow.",
        },
        {
          role: "system",
          content:
            "The conversation transcript is contained in delimiters:\n\n```\n" +
            this.transcript
              .slice(10)
              .map((entry) => entry.transcript)
              .join(" ") +
            "\n```",
        },
        {
          role: "system",
          content:
            "The question from the user follows. You have the opportunity to decide how best to respond. Choose which function will be best.",
        },
        { role: "user", content: body.question },
      ] as OpenAIMessage[];

      //console.log("prompt", JSON.stringify(messages, null, 2));

      const decision_calls = await getChatCompletionResponse({
        messages,
        tool: new IntentFunction(),
      });

      const bestFunctionArgs = JSON.parse(decision_calls[0].function.arguments);
      const bestFunctionName = bestFunctionArgs.bestFunction;
      const bestFunction =
        bestFunctionName === "sendStatement"
          ? new StatementFunction()
          : new ListFunction();

      const messages2 = [
        ...messages.slice(0, 2),
        {
          role: "system",
          content:
            "The question from the user follows. BE BRIEF in your responses. Give only your answer, and do not repeat the question or give other explanatory text other than the brief answer. Always respond using the provided function call, never messages.",
        },
        { role: "user", content: body.question },
      ] as OpenAIMessage[];

      const tool_calls = await getChatCompletionResponse({
        messages: messages2,
        tool: bestFunction,
      });

      return Response.json({ decision_calls, tool_calls });
    }

    return new Response("Method not allowed", { status: 405 });
  }
}

AssistantServer satisfies Party.Worker;
