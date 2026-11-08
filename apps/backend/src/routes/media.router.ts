import { FastifyInstance } from "fastify";
import {
  uploadAvatarHandler,
  uploadBannerHandler,
  uploadAttachmentHandler,
  deleteAttachmentHandler,
} from "../controllers/media.controller.js";
import { deleteAttachmentRouteSchema } from "../validations/media.val.js";

export async function PrivateMediaRoutes(fastify: FastifyInstance) {
  fastify.post("/media/avatar", uploadAvatarHandler);
  fastify.post("/media/banner", uploadBannerHandler);
  fastify.post("/media/attachment", uploadAttachmentHandler);
  fastify.delete(
    "/media/attachment",
    { schema: deleteAttachmentRouteSchema },
    deleteAttachmentHandler,
  );
}
