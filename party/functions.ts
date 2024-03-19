import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";

type OpenAIFunctionType = {
  name: string;
  description: string;
  schema: z.ZodObject<any, any>;
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

  constructor(
    name: string,
    description: string,
    schema: z.ZodObject<any, any>
  ) {
    this.name = name;
    this.description = description;
    this.schema = schema;
  }

  getSignature() {
    return {
      name: this.name,
      description: this.description,
      parameters: zodToJsonSchema(this.schema, { target: "openApi3" }),
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
    .describe("Toggle light")
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
    .describe("Move robot")
);

const lookWithRobotFunction = new OpenAIFunction(
  "lookWithRobot",
  "Look into the robot's current room, returning the fixed and moving items (only if the room is light).",
  z.object({}).describe("List the contents of the room the robot is in")
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
      ]),
    })
    .describe("Function to call")
);

export const allFunctions = [
  toggleLightFunction,
  moveRobotFunction,
  lookWithRobotFunction,
];
