import { FastifyReply, FastifyRequest } from "fastify";
import { getUserCredentials } from "../db/queries/users.js";
import bcrypt from "bcryptjs";
import { NODE_ENV } from "../config/env.js";
import { setupAdminUser } from "../utils/user.js";

export const handleLogin = async (request: FastifyRequest, reply: FastifyReply) => {
  const body = request.body as { username: string; password: string };

  if (!body.username || !body.password) {
    return reply
      .status(400)
      .send({ error: "Username and password are required" });
  }

  const user = await getUserCredentials();

  if (
    body.username !== user?.username ||
    !(await bcrypt.compare(body.password, user?.passwordHash))
  ) {
    return reply.status(401).send({
      error: "Invalid credentials",
    });
  }

  const token = await reply.jwtSign(
    {
      username: body.username,
    },
    {
      expiresIn: "7d",
    },
  );

  return reply
    .setCookie("auth", token, {
      path: "/",
      httpOnly: true,
      secure: NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
    })
    .status(200)
    .send({ message: "Logged in." });
};

export const handleLogout = async (request: FastifyRequest, reply: FastifyReply) => {
  return reply
    .clearCookie("auth", {
      path: "/",
    })
    .status(200)
    .send({ message: "Logged out." });
};

export const handleSetup = async (request: FastifyRequest, reply: FastifyReply) => {
  const { username, password } = request.body as {
    username: string;
    password: string;
  };

  const admin = await getUserCredentials();

  if (admin) {
    return reply.status(403).send({
      error: "Instance is already configured.",
    });
  }

  await setupAdminUser(username, password);

  const token = await reply.jwtSign(
    {
      username: username,
    },
    {
      expiresIn: "7d",
    },
  );

  return reply
    .setCookie("auth", token, {
      httpOnly: true,
      secure: NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    })
    .status(201)
    .send({
      message: "Setup complete.",
    });
};
