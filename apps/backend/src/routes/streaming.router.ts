import type { FastifyInstance, FastifyRequest } from "fastify";
import type { RawData, WebSocket } from "ws";
import {
  parseClientFrame,
  timelineHub,
  type TimelineConnection,
  type TimelineHub,
} from "../services/timeline-stream.js";

export type StreamingRouteOptions = {
  hub?: TimelineHub;
  authenticate?: (request: FastifyRequest) => Promise<boolean>;
};

async function defaultAuthenticate(request: FastifyRequest) {
  try {
    await request.jwtVerify();
    return true;
  } catch {
    return false;
  }
}

export async function streamingRoutes(
  fastify: FastifyInstance,
  options: StreamingRouteOptions = {},
) {
  const hub = options.hub ?? timelineHub;
  const authenticate = options.authenticate ?? defaultAuthenticate;

  fastify.get("/streaming", { websocket: true }, (socket: WebSocket, request) => {
    let connection: TimelineConnection | undefined;
    let closed = false;
    const queued: RawData[] = [];

    const cleanup = () => {
      if (closed) return;
      closed = true;
      if (connection) hub.disconnect(connection);
      request.log.info("Timeline stream disconnected");
    };

    const handleMessage = (message: RawData) => {
      if (!connection) return;
      const parsed = parseClientFrame(message.toString());
      if ("error" in parsed) {
        socket.send(JSON.stringify({ error: parsed.error }));
        return;
      }

      const error = hub.handleFrame(connection, parsed);
      if (error) socket.send(JSON.stringify({ error }));
    };

    socket.on("message", (message) => {
      if (!connection) {
        queued.push(message);
        return;
      }
      handleMessage(message);
    });

    socket.on("close", cleanup);
    socket.on("error", (error) => {
      request.log.error({ err: error }, "Timeline stream error");
      cleanup();
    });

    void authenticate(request)
      .then((isAuthenticated) => {
        if (closed) return;
        connection = hub.connect(socket, { authenticated: isAuthenticated });
        request.log.info(
          { authenticated: isAuthenticated },
          "Timeline stream connected",
        );
        for (const message of queued) handleMessage(message);
        queued.length = 0;
      })
      .catch((error: unknown) => {
        request.log.error({ err: error }, "Timeline stream authentication failed");
        socket.close();
      });
  });
}
