import Fastify from "fastify";
import cors from "@fastify/cors";
import dotenv from "dotenv";
import { activityPubRoutes } from "./routes/activitypub.router.js";
import { APIRoutes } from "./routes/api.router.js";
import { PORT, NODE_ENV } from "./config/env.js";
import { handleWebFinger } from "./controllers/webfinger.controller.js";

dotenv.config();

const fastify = Fastify({
  logger: {
    transport: {
      target: "pino-pretty",
      options: {
        colorize: true,
        translateTime: "SYS:standard",
      },
    },
  },
});

if (NODE_ENV !== "production") {
  fastify.addHook("preHandler", async (request) => {
    request.log.info(
      {
        body: request.body,
      },
      "Request body",
    );
  });
}

await fastify.register(cors, { origin: true });

fastify.addContentTypeParser(
  "application/activity+json",
  { parseAs: "string" },
  (req, body, done) => {
    try {
      const json = JSON.parse(body as string);
      done(null, json);
    } catch (err: any) {
      err.statusCode = 400;
      done(err, undefined);
    }
  },
);

fastify.get("/.well-known/webfinger", handleWebFinger);
await fastify.register(activityPubRoutes);
await fastify.register(APIRoutes, { prefix: "/api" });

const start = async () => {
  try {
    const port = PORT;
    await fastify.listen({ port, host: "0.0.0.0" });
    console.log(`SoloSocius Server spinning on port ${port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
