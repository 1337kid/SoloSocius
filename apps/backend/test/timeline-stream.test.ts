import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  TimelineHub,
  broadcastTimelineEvent,
  parseClientFrame,
  serializeServerFrame,
  streamsForActor,
} from "../src/services/timeline-stream.js";

function fakeSocket() {
  const messages: string[] = [];
  return {
    messages,
    readyState: 1,
    send(data: string) {
      messages.push(data);
    },
  };
}

describe("timeline stream frames", () => {
  it("parses subscribe and unsubscribe frames", () => {
    assert.deepEqual(parseClientFrame('{"type":"subscribe","stream":"user"}'), {
      type: "subscribe",
      stream: "user",
    });
    assert.deepEqual(
      parseClientFrame('{"type":"unsubscribe","stream":"public:local"}'),
      { type: "unsubscribe", stream: "public:local" },
    );
  });

  it("rejects malformed frames", () => {
    assert.deepEqual(parseClientFrame("nope"), {
      error: "Invalid message",
    });
    assert.deepEqual(parseClientFrame('{"type":"subscribe","stream":"home"}'), {
      error: "Unknown stream",
    });
    assert.deepEqual(parseClientFrame('{"type":"ping"}'), {
      error: "Unknown message type",
    });
  });

  it("serializes a server frame with a string payload", () => {
    const raw = serializeServerFrame({
      stream: ["user", "public"],
      event: "update",
      payload: { post: { id: "p1" } },
    });
    const frame = JSON.parse(raw);
    assert.deepEqual(frame.stream, ["user", "public"]);
    assert.equal(frame.event, "update");
    assert.equal(typeof frame.payload, "string");
    assert.deepEqual(JSON.parse(frame.payload), { post: { id: "p1" } });
  });
});

describe("timeline hub", () => {
  it("lets an anonymous socket subscribe only to the local public stream", () => {
    const hub = new TimelineHub();
    const socket = fakeSocket();
    const connection = hub.connect(socket, { authenticated: false });

    assert.equal(
      hub.handleFrame(connection, {
        type: "subscribe",
        stream: "public:local",
      }),
      null,
    );
    assert.equal(
      hub.handleFrame(connection, { type: "subscribe", stream: "user" }),
      "Authentication required",
    );
    assert.equal(
      hub.handleFrame(connection, { type: "subscribe", stream: "public" }),
      "Authentication required",
    );

    hub.publish("update", { id: "local" }, ["public:local"]);
    hub.publish("update", { id: "home" }, ["user"]);

    assert.equal(socket.messages.length, 1);
    const frame = JSON.parse(socket.messages[0]);
    assert.deepEqual(frame.stream, ["public:local"]);
    assert.equal(JSON.parse(frame.payload).id, "local");
  });

  it("fans out only to sockets subscribed to a matching stream", () => {
    const hub = new TimelineHub();
    const home = fakeSocket();
    const federated = fakeSocket();
    const both = fakeSocket();

    const homeConn = hub.connect(home, { authenticated: true });
    const federatedConn = hub.connect(federated, { authenticated: true });
    const bothConn = hub.connect(both, { authenticated: true });

    hub.handleFrame(homeConn, { type: "subscribe", stream: "user" });
    hub.handleFrame(federatedConn, { type: "subscribe", stream: "public" });
    hub.handleFrame(bothConn, { type: "subscribe", stream: "user" });
    hub.handleFrame(bothConn, { type: "subscribe", stream: "public" });

    hub.publish("update", { id: "post" }, ["user", "public"]);

    assert.equal(home.messages.length, 1);
    assert.deepEqual(JSON.parse(home.messages[0]).stream, ["user"]);
    assert.equal(federated.messages.length, 1);
    assert.deepEqual(JSON.parse(federated.messages[0]).stream, ["public"]);
    assert.deepEqual(JSON.parse(both.messages[0]).stream, ["user", "public"]);
  });

  it("stops delivery after unsubscribe, disconnect, or a closed socket", () => {
    const hub = new TimelineHub();
    const leaving = fakeSocket();
    const closed = fakeSocket();
    const staying = fakeSocket();

    const leavingConn = hub.connect(leaving, { authenticated: true });
    const closedConn = hub.connect(closed, { authenticated: true });
    const stayingConn = hub.connect(staying, { authenticated: true });

    hub.handleFrame(leavingConn, { type: "subscribe", stream: "user" });
    hub.handleFrame(closedConn, { type: "subscribe", stream: "user" });
    hub.handleFrame(stayingConn, { type: "subscribe", stream: "user" });

    hub.handleFrame(leavingConn, { type: "unsubscribe", stream: "user" });
    hub.disconnect(closedConn);
    closed.readyState = 3;

    hub.publish("delete", { postId: "p1" }, ["user"]);

    assert.equal(leaving.messages.length, 0);
    assert.equal(closed.messages.length, 0);
    assert.equal(staying.messages.length, 1);
  });
});

const item = {
  event: { createdAt: "2020-01-01T00:00:00.000Z", type: "post" as const },
  actor: {
    actorUri: "https://local.example/users/me",
    username: "me",
    domain: "local.example",
    displayName: null,
    avatarUrl: null,
  },
  post: { id: "post-1" },
};

describe("timeline stream selection", () => {
  const localActorUri = "https://local.example/users/me";
  const followed = ["https://remote.example/users/bob"];

  it("puts a local post on the home, local, and federated streams", () => {
    assert.deepEqual(
      streamsForActor({
        actorUri: localActorUri,
        localActorUri,
        followedActorUris: followed,
      }),
      ["user", "public:local", "public"],
    );
  });

  it("puts a followed actor on the home and federated streams", () => {
    assert.deepEqual(
      streamsForActor({
        actorUri: followed[0],
        localActorUri,
        followedActorUris: followed,
      }),
      ["user", "public"],
    );
  });

  it("puts everyone else on the federated stream only", () => {
    assert.deepEqual(
      streamsForActor({
        actorUri: "https://remote.example/users/carol",
        localActorUri,
        followedActorUris: followed,
      }),
      ["public"],
    );
  });
});

describe("broadcastTimelineEvent", () => {
  function deps(loadItem: (query: { postUri: string }) => Promise<unknown>) {
    const published: Array<{
      event: string;
      payload: unknown;
      streams: readonly string[];
    }> = [];
    return {
      published,
      hub: {
        publish(event: string, payload: unknown, streams: readonly string[]) {
          published.push({ event, payload, streams });
        },
      },
      loadItem,
      followedActorUris: async () => ["https://remote.example/users/bob"],
      localActorUri: "https://local.example/users/me",
    };
  }

  it("publishes a new post to the streams selected for its actor", async () => {
    const broadcast = deps(async () => item);
    await broadcastTimelineEvent(
      {
        kind: "update",
        postUri: "https://local.example/posts/1",
        actorUri: "https://local.example/users/me",
        type: "post",
      },
      broadcast,
    );

    assert.deepEqual(broadcast.published, [
      {
        event: "update",
        payload: item,
        streams: ["user", "public:local", "public"],
      },
    ]);
  });

  it("skips the publish when the timeline row cannot be loaded", async () => {
    const broadcast = deps(async () => null);
    await broadcastTimelineEvent(
      {
        kind: "update",
        postUri: "https://local.example/posts/missing",
        actorUri: "https://local.example/users/me",
        type: "post",
      },
      broadcast,
    );
    assert.deepEqual(broadcast.published, []);
  });

  it("sends a post delete and a status update to every stream", async () => {
    const broadcast = deps(async () => item);
    await broadcastTimelineEvent(
      {
        kind: "delete",
        postId: "post-1",
        actorUri: "https://remote.example/users/carol",
        eventType: "post",
      },
      broadcast,
    );
    await broadcastTimelineEvent(
      { kind: "status.update", postUri: "https://local.example/posts/1" },
      broadcast,
    );

    assert.deepEqual(
      broadcast.published.map((entry) => entry.event),
      ["delete", "status.update"],
    );
    assert.deepEqual(broadcast.published[0].payload, {
      postId: "post-1",
      eventType: "post",
      actorUri: "https://remote.example/users/carol",
    });
    assert.deepEqual(broadcast.published[0].streams, [
      "user",
      "public",
      "public:local",
    ]);
    assert.equal(broadcast.published[1].payload, item);
    assert.deepEqual(broadcast.published[1].streams, [
      "user",
      "public",
      "public:local",
    ]);
  });

  it("removes a boost only from the booster's streams", async () => {
    const broadcast = deps(async () => item);
    await broadcastTimelineEvent(
      {
        kind: "delete",
        postId: "post-1",
        actorUri: "https://remote.example/users/bob",
        eventType: "boost",
      },
      broadcast,
    );

    assert.deepEqual(broadcast.published, [
      {
        event: "delete",
        payload: {
          postId: "post-1",
          eventType: "boost",
          actorUri: "https://remote.example/users/bob",
        },
        streams: ["user", "public"],
      },
    ]);
  });
});
