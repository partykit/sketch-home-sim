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
        break;
    }
  }
}

WorldServer satisfies Party.Worker;
