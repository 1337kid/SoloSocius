import Fastify from "fastify";
import cors from "@fastify/cors";
import multipart from "@fastify/multipart";
import { activityPubRoutes } from "./routes/activitypub.router.js";
import { PublicRoutes } from "./routes/public.router.js";
import { PORT } from "./config/env.js";
import { loggerConfig } from "./config/logger.js";
import { AuthRoutes } from "./routes/auth.router.js";
import authPlugin from "./plugins/authPlugin.js";
import contentTypeParser from "./plugins/contentTypeParser.js";
import requestBodyLogger from "./plugins/requestBodyLogger.js";
import { PrivateRoutes } from "./routes/private.router.js";

const fastify = Fastify({ logger: loggerConfig });

await fastify.register(requestBodyLogger);
await fastify.register(authPlugin);
await fastify.register(contentTypeParser);
await fastify.register(multipart);
await fastify.register(cors, {
  origin: true,
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
});

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
