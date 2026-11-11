import type { MessageResponse } from "./common.js";

export type RelayStatus = "pending" | "accepted" | "rejected" | "unsubscribed";

export interface Relay {
  id: string;
  name: string;
  inboxUrl: string;
  status: RelayStatus;
}

export interface CreateRelayRequest {
  name: string;
  inboxUrl: string;
}

export type GetRelaysResponse = Relay[];

export type CreateRelayResponse = Relay;

export type UnsubscribeRelayResponse = Relay;

export type DeleteRelayResponse = MessageResponse;
