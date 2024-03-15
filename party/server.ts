import type * as Party from "partykit/server";
import { DEFAULT_WORLD } from "./world";
import type { World } from "./world";

export default class WorldServer implements Party.Server {
  world: World = DEFAULT_WORLD;

  constructor(readonly room: Party.Room) {}

  onConnect(conn: Party.Connection, ctx: Party.ConnectionContext) {
    conn.send(JSON.stringify({ type: "sync", state: this.world }));
  }

  onMessage(message: string, sender: Party.Connection) {}

  onRequest(req: Party.Request) {
    return new Response(JSON.stringify({ world: this.world }, null, 2));
  }
}

WorldServer satisfies Party.Worker;
