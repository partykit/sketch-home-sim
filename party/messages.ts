import type { World } from "./world";

export type SyncMessage = {
  type: "sync";
  state: World;
};

export type AskUserMessage = {
  type: "askUser";
  toolCallId: string;
  question: string;
};

export type AskUserResponseMessage = {
  type: "askUserResponse";
  toolCallId: string;
  answer: string;
};
