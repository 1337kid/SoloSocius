import { FastifyReply, FastifyRequest } from "fastify";
import { getPublicMediaUrl } from "../storage/utils.js";

export async function getMedia(req: FastifyRequest, res: FastifyReply) {
  const { key } = req.params as {
    key: string;
  };

  if (!key) {
    return res.code(400).send({
      error: "Missing media key",
    });
  }

  if (key.includes("..") || key.startsWith("/") || key.startsWith("\\")) {
    return res.code(400).send({
      error: "Invalid media key",
    });
  }

  const url = getPublicMediaUrl(key);

  res.header("Cache-Control", "public, max-age=31536000, immutable");

  return res.redirect(url);
}
