import { FastifyInstance } from "fastify";

import {
  createPost,
  updatePost,
  deletePost,
  getPostWithReplies,
} from "../controllers/posts.controller.js";
import { getHomeFeed } from "../controllers/timeline.controller.js";
import { defaultPageRouteSchema } from "../validations/pagination.val.js";
import {
  createPostRouteSchema,
  postIdRouteSchema,
  updatePostRouteSchema,
} from "../validations/posts.val.js";

export async function PostsRoutes(fastify: FastifyInstance) {
  fastify.post("/posts", { schema: createPostRouteSchema }, createPost);
  fastify.put("/posts/:id", { schema: updatePostRouteSchema }, updatePost);
  fastify.delete("/posts/:id", { schema: postIdRouteSchema }, deletePost);
  fastify.get("/posts/:id", { schema: postIdRouteSchema }, getPostWithReplies);

  fastify.get("/feed", { schema: defaultPageRouteSchema }, getHomeFeed);
}
