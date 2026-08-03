import { NODE_ENV } from "./env.js";
import type { FastifyServerOptions } from "fastify";

export const loggerConfig: FastifyServerOptions["logger"] =
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
    : false;
