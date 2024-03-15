import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";

type OpenAIFunctionType = {
  name: string;
  description: string;
  schema: z.ZodObject<any, any>;
  getSignature: () => {
    name: string;
    description: string;
    schema: any;
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
      schema: zodToJsonSchema(this.schema, { target: "openApi3" }),
    };
  }
}

const toggleLightFunction = new OpenAIFunction(
  "toggleLight",
  "Toggle the light in a room, making it light or dark. You can see what's in a room when it's light.",
  z.object({
    lightId: z.string(),
  })
);
