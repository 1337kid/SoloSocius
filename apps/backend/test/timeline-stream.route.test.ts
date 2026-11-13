import assert from "node:assert/strict";
import { once } from "node:events";
import { after, before, describe, it } from "node:test";
import Fastify, { type FastifyInstance, type FastifyRequest } from "fastify";
import type { WebSocket } from "ws";
import websocketPlugin from "../src/plugins/websocket.js";
import { streamingRoutes } from "../src/routes/streaming.router.js";
import { TimelineHub } from "../src/services/timeline-stream.js";

function nextMessage(socket: WebSocket) {
  return new Promise<string>((resolve, reject) => {
    const timer = setTimeout(
      () => reject(new Error("timed out waiting for frame")),
      1000,
    );
    socket.once("message", (data) => {
      clearTimeout(timer);
      resolve(data.toString());
    });
  });
}

async function closeSocket(socket: WebSocket) {
  const closed = once(socket, "close");
  socket.terminate();
  await closed;
}

async function flush() {
  await new Promise((resolve) => setImmediate(resolve));
}

describe("GET /api/streaming", () => {
  let app: FastifyInstance;
  let hub: TimelineHub;

  before(async () => {
    hub = new TimelineHub();
    app = Fastify({ logger: false });
    await app.register(websocketPlugin);
    await app.register(
      async (child) => {
        await streamingRoutes(child, {
          hub,
          authenticate: async (request: FastifyRequest) =>
            request.headers["x-test-auth"] === "yes",
        });
      },
      { prefix: "/api" },
    );
    await app.ready();
  });

  after(async () => {
    await app.close();
  });

  it("multiplexes subscribed streams on one socket", async () => {
    const ws = await app.injectWS("/api/streaming", {
      headers: { "x-test-auth": "yes" },
    });

    const framePromise = nextMessage(ws);
    ws.send(JSON.stringify({ type: "subscribe", stream: "user" }));
    ws.send(JSON.stringify({ type: "subscribe", stream: "public" }));
    await flush();
    hub.publish("update", { id: "post-1" }, ["user", "public", "public:local"]);

    const frame = JSON.parse(await framePromise);
    assert.deepEqual(frame.stream, ["user", "public"]);
    assert.equal(frame.event, "update");
    assert.equal(JSON.parse(frame.payload).id, "post-1");
    await closeSocket(ws);
  });

  it("rejects a home or federated subscribe when authentication fails", async () => {
    const ws = await app.injectWS("/api/streaming");
    const first = nextMessage(ws);
    ws.send(JSON.stringify({ type: "subscribe", stream: "public:local" }));
    ws.send(JSON.stringify({ type: "subscribe", stream: "user" }));
    await flush();
    hub.publish("update", { id: "local-only" }, ["public:local"]);

    const frames = [JSON.parse(await first), JSON.parse(await nextMessage(ws))];
    assert.equal(
      frames.find((frame) => frame.error)?.error,
      "Authentication required",
    );
    const update = frames.find((frame) => frame.event === "update");
    assert.equal(JSON.parse(update.payload).id, "local-only");
    await closeSocket(ws);
  });

  it("drops the socket from the hub on close and error", async () => {
    const closed = await app.injectWS("/api/streaming", {
      headers: { "x-test-auth": "yes" },
    });
    const broken = await app.injectWS("/api/streaming", {
      headers: { "x-test-auth": "yes" },
    });
    const staying = await app.injectWS("/api/streaming", {
      headers: { "x-test-auth": "yes" },
    });

    closed.send(JSON.stringify({ type: "subscribe", stream: "user" }));
    broken.send(JSON.stringify({ type: "subscribe", stream: "user" }));
    staying.send(JSON.stringify({ type: "subscribe", stream: "user" }));
    await flush();
    assert.equal(hub.connectionCount, 3);

    await closeSocket(closed);

    const brokenStream = (
      broken as unknown as { _socket: { destroy(error?: Error): void } }
    )._socket;
    const brokenDone = once(broken, "close");
    brokenStream.destroy(new Error("socket failed"));
    await brokenDone;

    assert.equal(hub.connectionCount, 1);

    const message = nextMessage(staying);
    hub.publish("update", { id: "still-there" }, ["user"]);
    assert.equal(JSON.parse(await message).event, "update");
    await closeSocket(staying);
  });
});
