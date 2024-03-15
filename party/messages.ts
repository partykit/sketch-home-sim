import type { World } from "./world";

export type SyncMessage = {
  type: "sync";
  state: World;
};
