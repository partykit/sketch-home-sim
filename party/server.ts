import type * as Party from "partykit/server";
import { DEFAULT_WORLD } from "./world";
import type { World, FixedItemLight } from "./world";
import { allFunctions } from "./functions";

export default class WorldServer implements Party.Server {
  world: World = DEFAULT_WORLD;

  constructor(readonly room: Party.Room) {}

  onConnect(conn: Party.Connection, ctx: Party.ConnectionContext) {
    conn.send(JSON.stringify({ type: "sync", state: this.world }));
  }

  onMessage(message: string, sender: Party.Connection) {}

  async onRequest(req: Party.Request) {
    if (req.method === "POST") {
      const path = new URL(req.url).pathname;
      const body = await req.json();
      if (path.endsWith("/call")) {
        const { fn, args } = body as any;
        console.log("fn", fn, "args", args);
        if (!allFunctions.map((f) => f.name).includes(fn)) {
          return new Response("Unknown Function", { status: 500 });
        }

        const result = this.handleFunctionCall(fn, args);

        this.room.broadcast(
          JSON.stringify({ type: "sync", state: this.world })
        );
        return new Response(JSON.stringify(result, null, 2));
      }

      return new Response("Not Found", { status: 404 });
    } else if (req.method === "GET") {
      return new Response(JSON.stringify({ world: this.world }, null, 2));
    }

    return new Response("Method Not Allowed", { status: 405 });
  }

  handleFunctionCall(fn: string, args: any) {
    const robot = this.world.moveableItems.find((i) => i.type === "robot");
    const robotLocation = this.world.locations.find(
      (l) => l.id === robot?.location
    );
    switch (fn) {
      case "toggleLight":
        // Get the location and the item to toggle using args.lightId
        const location = this.world.locations.find((l) =>
          l.contents.some((i) => i.type === "light" && i.id === args.lightId)
        );
        if (!location) {
          return { error: "No light found with that ID" };
        }
        const light = location.contents.find(
          (i) => i.type === "light" && i.id === args.lightId
        ) as FixedItemLight;
        light.state.on = !light.state.on;
        return {
          result: `Light with id <${light.id}> in room with id <${
            location.id
          }> is now: ${light.state ? "on" : "off"}`,
        };
      case "moveRobot":
        // Check for errors
        if (!robot) {
          return { error: "No robot found" };
        }
        // Get the current location of the robot
        if (!robotLocation) {
          return { error: "Robot is in an unknown location" };
        }
        // Check if the destination is a valid exit
        if (!robotLocation.exits.includes(args.destinationRoomId)) {
          return {
            error: `Destination room with ID <${args.destinationRoomId}> is not adjacent to current room with ID <${currentLocation.id}>`,
          };
        }
        // Move the robot
        robot.location = args.destinationRoomId;
        return {
          result: `Robot moved to room with ID <${args.destinationRoomId}>`,
        };
      case "lookWithRobot":
        // Check for errors
        if (!robot) {
          return { error: "No robot found" };
        }
        // Get the current location of the robot
        if (!robotLocation) {
          return { error: "Robot is in an unknown location" };
        }
        // Is it dark? If so, return an error
        const robotLocationLight = robotLocation.contents.find(
          (i) => i.type === "light"
        ) as FixedItemLight;
        if (!robotLocationLight.state.on) {
          return { error: "It's too dark to see anything" };
        }
        // Return the contents of the location including movable items
        // The format is:
        // ```The robot is in Hallway (ID <hallway>). It can see: Light (ID <hallway-light>), [etc]```
        // The list of items includes fixed items and movable items (excluding the robot itself)
        const fixedItems = robotLocation.contents;
        const movableItems = this.world.moveableItems.filter(
          (i) => i.location === robotLocation.id && i.id !== robot.id
        );
        return {
          result: `The robot is in ${robotLocation.name} (ID <${
            robotLocation.id
          }>). It can see: ${fixedItems
            .map((i) => `${i.name} (ID <${i.id}>)`)
            .join(", ")}, ${movableItems
            .map((i) => `${i.name} (ID <${i.id}>)`)
            .join(", ")}`,
        };
    }
  }
}

WorldServer satisfies Party.Worker;
