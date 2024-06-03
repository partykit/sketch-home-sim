import type * as Party from "partykit/server";
import { intentFunction, allFunctions } from "./functions";
import { getChatCompletionResponse } from "./openai";
import type { OpenAIMessage } from "./openai";
import type {
  SyncMessage,
  AskUserMessage,
  AskUserResponseMessage,
} from "./messages";
import { TEST_INSTRUCTION, TEST_TRANSCRIPT } from "./test";

const MAX_INSTRUCTIONS = 20;

export default class AssistantServer implements Party.Server {
  instruction: string | null = null; //TEST_INSTRUCTION;
  remaining = MAX_INSTRUCTIONS;
  transcript: OpenAIMessage[] = []; //TEST_TRANSCRIPT;
  halt: boolean = false;
  suspended: boolean = false;

  constructor(readonly room: Party.Room) {}

  onConnect(conn: Party.Connection) {
    this.broadcastSync();
  }

  async onMessage(message: string, conn: Party.Connection) {
    const data = JSON.parse(message);
    if (data.type === "instruct") {
      this.instruction = data.instruction;
      this.remaining = MAX_INSTRUCTIONS;
      this.transcript = [];
      this.halt = false;
      this.broadcastSync();
      await this.run();
    } else if (data.type === "askUserResponse") {
      if (this.suspended) {
        this.transcript = [
          ...this.transcript,
          {
            tool_call_id: data.toolCallId,
            role: "tool",
            name: "askUser",
            content: JSON.stringify({ success: data.answer }),
          },
        ];
        this.suspended = false;
        await this.run();
      }
    }
  }

  async run() {
    while (this.remaining > 0 && !this.halt && !this.suspended) {
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
          "You are a helpful AI assistant controlling a smart home. When the user refers to 'you' they either mean the entire home or the moveable robot that you control. You always know the layout of the home, the devices in it (which includes the robot), and their current states. You do not know the position of moveable items such as people, animals, and objects that might be carried, and you know even know their names initially. You can build your knowledge by using various devices. You call functions to control the devices in the home.",
      },
      {
        role: "system",
        content: `The current state of the home follows. The state of devices is up to date with your most recent functions. Consult the transcript for any other discoveries you have made:
        
        ${JSON.stringify(world, null, 2)}`,
      },
      {
        role: "system",
        content:
          "The user's instruction follows. Your goal is to fulfil it to the best of your ability. It may take a sequence of many instructions to achieve your goal, and you may have to deliberately build knowledge so you know enough to reach the goal. At each step, call the best function to move you closer to your goal. When you're done, call the halt function.",
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
        {
          role: "user",
          content:
            "Which of these functions will best move you closer to your goal?\n\n" +
            allFunctions
              .map((f) => `- ${f.name} -- ${f.description}`)
              .join("\n"),
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

    this.transcript = [
      ...this.transcript,
      {
        role: "assistant",
        content: `I have decided to call the function ${functionToCall.name} because: ${reasoning}`,
      },
    ];
    this.broadcastSync();

    // Clarify any arguments for the function, and get the call itself
    const toolCallMessage = await getChatCompletionResponse({
      messages: [
        ...intro,
        ...this.transcript,
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

    // Add the tool call to the transcript, before performing it
    this.transcript = [...this.transcript, toolCallMessage];
    this.broadcastSync();

    if (functionToCall.dispatchType === "LOCAL") {
      // We need to handle the function right here, instead of calling the remote world simulator

      // Abort without calling if the function is 'halt'
      if (functionToCall.name === "halt") {
        this.halt = true;
        return;
      }

      if (functionToCall.name === "askUser") {
        // If the function is 'askUser', we need to ask the user for input
        // We'll need to handle this in a different way
        this.room.broadcast(
          JSON.stringify(<AskUserMessage>{
            type: "askUser",
            question: JSON.parse(
              toolCallMessage.tool_calls[0].function.arguments
            ).question,
            toolCallId: toolCallMessage.tool_calls[0].id,
          })
        );
        this.suspended = true;
        return;
      }
    }

    // It's a REMOTE dispatchType. Go ahead and call the function

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
      {
        tool_call_id: toolCallMessage.tool_calls[0].id,
        role: "tool",
        name: functionToCall.name,
        content: JSON.stringify(result, null, 2),
      },
    ];
    this.broadcastSync();
  }
}

AssistantServer satisfies Party.Worker;
