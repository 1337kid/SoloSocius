import Fastify from "fastify";
import cors from "@fastify/cors";
import dotenv from "dotenv";
import { activityPubRoutes } from "./routes/activitypub.router.js";
import { PublicRoutes } from "./routes/public.router.js";
import { PORT, NODE_ENV } from "./config/env.js";
import { AuthRoutes } from "./routes/auth.router.js";
import authPlugin from "./plugins/authPlugin.js";
import { PrivateRoutes } from "./routes/private.router.js";

dotenv.config();

const fastify = Fastify({
  logger:
    NODE_ENV !== "production"
      ? {
          transport: {
            target: "pino-pretty",
            options: {
              colorize: true,
              translateTime: "SYS:standard",
            },
          },
        }
      : false,
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

await fastify.register(authPlugin);

await fastify.register(cors, {
  origin: true,
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
});

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

await fastify.register(activityPubRoutes);
await fastify.register(AuthRoutes, { prefix: "/api/auth" });
await fastify.register(PrivateRoutes, { prefix: "/api" });
await fastify.register(PublicRoutes, { prefix: "/api" });

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
