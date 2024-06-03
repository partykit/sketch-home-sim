import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";

type OpenAIFunctionType = {
  name: string;
  description: string;
  schema: z.ZodObject<any, any>;
  dispatchType: "REMOTE" | "LOCAL";
  getSignature: () => {
    name: string;
    description: string;
    parameters: any;
  };
};

class OpenAIFunction implements OpenAIFunctionType {
  name: string;
  description: string;
  schema: z.ZodObject<any, any>;
  dispatchType: "REMOTE" | "LOCAL";

  constructor(
    name: string,
    description: string,
    schema: z.ZodObject<any, any>,
    dispatchType: "REMOTE" | "LOCAL"
  ) {
    this.name = name;
    this.description = description;
    this.schema = schema;
    this.dispatchType = dispatchType;
  }

  getSignature() {
    return {
      name: this.name,
      description: this.description,
      parameters: zodToJsonSchema(this.schema, { target: "openApi3" }),
      dispatchType: this.dispatchType,
    };
  }
}

const toggleLightFunction = new OpenAIFunction(
  "toggleLight",
  "Toggle the light in a room, making it light or dark. You can see what's in a room when it's light.",
  z
    .object({
      lightId: z.string().describe("ID of the light to toggle"),
    })
    .describe("Toggle light"),
  "REMOTE"
);

const moveRobotFunction = new OpenAIFunction(
  "moveRobot",
  "Move the robot to an adjacent room. The robot can only move to rooms that are connected to its current location by an exit.",
  z
    .object({
      destinationRoomId: z
        .string()
        .describe("ID of the adjacent room to move the robot to"),
    })
    .describe("Move robot"),
  "REMOTE"
);

const lookWithRobotFunction = new OpenAIFunction(
  "lookWithRobot",
  "Look into the robot's current room, returning the fixed and moving items (only if the room is light).",
  z.object({}).describe("List the contents of the room the robot is in"),
  "REMOTE"
);

const askUserFunction = new OpenAIFunction(
  "askUser",
  "Ask the user a question. Use this to get more information or clarify something. Only use this as a last resort",
  z.object({ question: z.string() }).describe("The question to ask the user"),
  "LOCAL"
);

const haltFunction = new OpenAIFunction(
  "halt",
  "Stop operations because you've achieved the goal or can't go any further",
  z
    .object({
      messageToUser: z
        .string()
        .describe(
          "Report back to the user with a message. Remember that you may have performed a number of functions, and the current state of the home is not the state when the user made their request. Never use this to ask for more information."
        ),
    })
    .describe("Stop operations and report back to the user"),
  "LOCAL"
);

export const intentFunction = new OpenAIFunction(
  "decideBestFunction",
  "Decide which function to call next based on how to best respond to the user",

  z
    .object({
      reasoning: z.string(),
      bestFunction: z.enum([
        toggleLightFunction.name,
        moveRobotFunction.name,
        lookWithRobotFunction.name,
        askUserFunction.name,
        haltFunction.name,
      ]),
    })
    .describe("Function to call"),
  "LOCAL"
);

export const allFunctions = [
  toggleLightFunction,
  moveRobotFunction,
  lookWithRobotFunction,
  askUserFunction,
  haltFunction,
];
