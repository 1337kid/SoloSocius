import {
  TIMELINE_STREAMS,
  type TimelineClientFrame,
  type TimelineDeletePayload,
  type TimelineStream,
  type TimelineStreamEvent,
} from "@solosocius/api-types";

const AUTHENTICATED_STREAMS = new Set<TimelineStream>(["user", "public"]);

export interface TimelineSocket {
  send(data: string): void;
  readyState?: number;
}

export interface TimelineConnection {
  socket: TimelineSocket;
  authenticated: boolean;
  streams: Set<TimelineStream>;
}

const SOCKET_OPEN = 1;

export function parseClientFrame(
  raw: string,
): TimelineClientFrame | { error: string } {
  let value: unknown;
  try {
    value = JSON.parse(raw);
  } catch {
    return { error: "Invalid message" };
  }

  if (!value || typeof value !== "object") {
    return { error: "Invalid message" };
  }

  const frame = value as { type?: unknown; stream?: unknown };
  if (frame.type !== "subscribe" && frame.type !== "unsubscribe") {
    return { error: "Unknown message type" };
  }

  if (
    typeof frame.stream !== "string" ||
    !TIMELINE_STREAMS.includes(frame.stream as TimelineStream)
  ) {
    return { error: "Unknown stream" };
  }

  return {
    type: frame.type,
    stream: frame.stream as TimelineStream,
  };
}

export function serializeServerFrame(frame: {
  stream: TimelineStream[];
  event: TimelineStreamEvent;
  payload: unknown;
}): string {
  return JSON.stringify({
    stream: frame.stream,
    event: frame.event,
    payload: JSON.stringify(frame.payload),
  });
}

export class TimelineHub {
  private connections = new Set<TimelineConnection>();

  get connectionCount() {
    return this.connections.size;
  }

  connect(
    socket: TimelineSocket,
    options: { authenticated: boolean },
  ): TimelineConnection {
    const connection: TimelineConnection = {
      socket,
      authenticated: options.authenticated,
      streams: new Set(),
    };
    this.connections.add(connection);
    return connection;
  }

  disconnect(connection: TimelineConnection) {
    this.connections.delete(connection);
    connection.streams.clear();
  }

  handleFrame(
    connection: TimelineConnection,
    frame: TimelineClientFrame,
  ): string | null {
    if (frame.type === "unsubscribe") {
      connection.streams.delete(frame.stream);
      return null;
    }

    if (
      AUTHENTICATED_STREAMS.has(frame.stream) &&
      !connection.authenticated
    ) {
      return "Authentication required";
    }

    connection.streams.add(frame.stream);
    return null;
  }

  publish(
    event: TimelineStreamEvent,
    payload: unknown,
    streams: readonly TimelineStream[],
  ) {
    for (const connection of this.connections) {
      if (
        connection.socket.readyState !== undefined &&
        connection.socket.readyState !== SOCKET_OPEN
      ) {
        continue;
      }

      const matched = streams.filter((stream) =>
        connection.streams.has(stream),
      );
      if (matched.length === 0) continue;

      connection.socket.send(
        serializeServerFrame({
          stream: matched,
          event,
          payload,
        }),
      );
    }
  }
}

export const timelineHub = new TimelineHub();

export function streamsForActor({
  actorUri,
  localActorUri,
  followedActorUris,
}: {
  actorUri: string;
  localActorUri: string;
  followedActorUris: readonly string[];
}): TimelineStream[] {
  const streams: TimelineStream[] = ["public"];
  if (actorUri === localActorUri) {
    streams.unshift("user", "public:local");
    return streams;
  }
  if (followedActorUris.includes(actorUri)) {
    streams.unshift("user");
  }
  return streams;
}

const EVERY_STREAM: TimelineStream[] = [...TIMELINE_STREAMS];

export type TimelineBroadcast =
  | {
      kind: "update";
      postUri: string;
      actorUri: string;
      type: "post" | "boost";
    }
  | {
      kind: "status.update";
      postUri: string;
    }
  | {
      kind: "delete";
      postId: string;
      actorUri: string;
      eventType: "post" | "boost";
    };

export type TimelineBroadcastDeps = {
  hub: {
    publish(
      event: TimelineStreamEvent,
      payload: unknown,
      streams: readonly TimelineStream[],
    ): void;
  };
  loadItem: (query: {
    postUri: string;
    actorUri?: string;
    type?: "post" | "boost";
  }) => Promise<unknown>;
  followedActorUris: () => Promise<readonly string[]>;
  localActorUri: string;
};

export async function broadcastTimelineEvent(
  input: TimelineBroadcast,
  deps: TimelineBroadcastDeps,
) {
  if (input.kind === "delete") {
    const payload: TimelineDeletePayload = {
      postId: input.postId,
      eventType: input.eventType,
      actorUri: input.actorUri,
    };
    const streams =
      input.eventType === "post"
        ? EVERY_STREAM
        : streamsForActor({
            actorUri: input.actorUri,
            localActorUri: deps.localActorUri,
            followedActorUris: await deps.followedActorUris(),
          });
    deps.hub.publish("delete", payload, streams);
    return;
  }

  const item = await deps.loadItem(
    input.kind === "update"
      ? {
          postUri: input.postUri,
          actorUri: input.actorUri,
          type: input.type,
        }
      : { postUri: input.postUri },
  );
  if (!item) return;

  if (input.kind === "status.update") {
    deps.hub.publish("status.update", item, EVERY_STREAM);
    return;
  }

  const followedActorUris = await deps.followedActorUris();
  deps.hub.publish(
    "update",
    item,
    streamsForActor({
      actorUri: input.actorUri,
      localActorUri: deps.localActorUri,
      followedActorUris,
    }),
  );
}
