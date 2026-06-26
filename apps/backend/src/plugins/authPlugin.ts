import fp from "fastify-plugin";
import cookie from "@fastify/cookie";
import jwt from "@fastify/jwt";

export default fp(async (fastify) => {
  await fastify.register(cookie);

  await fastify.register(jwt, {
    secret: process.env.JWT_SECRET!,

    cookie: {
      cookieName: "auth",
      signed: false,
    },
  });
});