import type * as Party from "partykit/server";
import { intentFunction, allFunctions } from "./functions";
import { getChatCompletionResponse } from "./openai";
import type { OpenAIMessage } from "./openai";
import type OpenAI from "openai";

const MAX_INSTRUCTIONS = 5;

export default class AssistantServer implements Party.Server {
  instruction: string | null = null;
  remaining = MAX_INSTRUCTIONS;
  transcript: OpenAIMessage[] = [];

  constructor(readonly room: Party.Room) {}

  async onMessage(message: string, conn: Party.Connection) {
    const data = JSON.parse(message);
    if (data.type === "instruct") {
      this.instruction = data.instruction;
      this.remaining = MAX_INSTRUCTIONS;
      this.broadcastSync();
      await this.tick();
      this.remaining--;
      this.broadcastSync();
    }
  }

  broadcastSync() {
    this.room.broadcast(
      JSON.stringify({
        type: "sync",
        state: {
          instruction: this.instruction,
          remaining: this.remaining,
          transcript: this.transcript,
        },
      })
    );
  }

  async tick() {
    // Decide on a function and then perform it
    // In order, this is what we'll do:
    // - Fetch the current world state
    // - Build a transcript which includes:
    //    - The world state
    //    - The instruction
    //    - A list of functions performed so far and their results
    // - Run this transcript using intentFunction
    // - Perform the returned function
    // - Add to the transcript and return the result
    const res = await this.room.context.parties.main
      .get(this.room.id)
      .fetch("/world", { method: "GET" });
    const world = await res.json();

    const intro = [
      {
        role: "system",
        content:
          "You are a helpful AI assistant controlling a smart home. You always know the layout of the home, the devices in it, and their current states. You do not know the position of moveable items such as people, animals, and objects that might be carried. You call functions to control the devices in the home.",
      },
      {
        role: "system",
        content: `The current state of the home follows. The state of devices is up to date with your most recent functions. You will have to consult the transcript for any other discoveries you have made:
        
        ${JSON.stringify(world, null, 2)}`,
      },
      {
        role: "system",
        content:
          "The user's instruction follows. Your goal is to fulfil it to the best of your ability. It may take a sequence of many instructions to achieve your goal. At each step, call the best function to move you closer to your goal. When you're done, call the halt function.",
      },
      {
        role: "user",
        content: `Instruction: ${this.instruction}`,
      },
    ] as OpenAIMessage[];

    const intentMessage = await getChatCompletionResponse({
      messages: [
        ...intro,
        ...this.transcript,
        {
          role: "system",
          content:
            "You now have the opportunity to decide how best to respond. Choose which function will be best.",
        },
      ],
      tool: intentFunction,
    });

    if (!intentMessage || !intentMessage.tool_calls) {
      console.error("No intent message");
      return;
    }

    const intentArgs = JSON.parse(
      intentMessage.tool_calls[0].function.arguments
    );
    const intentFunctionName = intentArgs.bestFunction;

    // Get the function
    const functionToCall = allFunctions.find(
      (f) => f.name === intentFunctionName
    );
    const reasoning = intentArgs.reasoning;

    if (!functionToCall) {
      console.error("Unknown function", intentFunctionName);
      return;
    }

    // Clarify any arguments for the function, and get the call itself
    const toolCallMessage = await getChatCompletionResponse({
      messages: [
        ...intro,
        ...this.transcript,
        {
          role: "assistant",
          content: `I have decided to call the function ${functionToCall.name} because: ${reasoning}`,
        },
        {
          role: "system",
          content:
            "Call the available function to move closer to your goal. You may have to add arguments. Only use a function call. Do not reply with a text message.",
        },
      ],
      tool: functionToCall,
    });

    if (!toolCallMessage || !toolCallMessage.tool_calls) {
      console.error("No tool call message");
      return;
    }

    const toolCallArgs = JSON.parse(
      toolCallMessage.tool_calls[0].function.arguments
    );

    // Perform the function by calling the function on the server
    const callResult = await this.room.context.parties.main
      .get(this.room.id)
      .fetch("/call", {
        method: "POST",
        body: JSON.stringify({
          fn: functionToCall.name,
          args: toolCallArgs,
        }),
      });
    const result = await callResult.json();

    // Add the tool call and the result to the transcript
    this.transcript = [
      ...this.transcript,
      toolCallMessage,
      {
        tool_call_id: toolCallMessage.tool_calls[0].id,
        role: "tool",
        name: functionToCall.name,
        content: JSON.stringify(result, null, 2),
      },
    ];
  }

  /*async onRequest(req: Party.Request) {
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
  }*/
}

AssistantServer satisfies Party.Worker;
