import assert from "node:assert/strict";
import { before, describe, it } from "node:test";
import Fastify, { type FastifyInstance } from "fastify";
import { authCredentialsRouteSchema } from "../src/validations/auth.val.js";
import {
  createPostRouteSchema,
  postIdRouteSchema,
  updatePostRouteSchema,
} from "../src/validations/posts.val.js";
import {
  deleteAccountRouteSchema,
  updateProfileRouteSchema,
} from "../src/validations/user.val.js";
import {
  deleteAttachmentRouteSchema,
  mediaKeyRouteSchema,
} from "../src/validations/media.val.ts";
import {
  actorUriRouteSchema,
  followRequestIdRouteSchema,
  interactionRouteSchema,
  searchUserRouteSchema,
} from "../src/validations/social.val.js";
import {
  defaultPageRouteSchema,
  optionalPageRouteSchema,
} from "../src/validations/pagination.val.js";
import { webFingerRouteSchema } from "../src/validations/webfinger.val.js";
import { registerValidationErrorHandler } from "../src/plugins/validationError.js";

const POST_ID = "123e4567-e89b-12d3-a456-426614174000";

async function buildSchemaApp(): Promise<FastifyInstance> {
  const app = Fastify({ logger: false });
  registerValidationErrorHandler(app);

  const echo = async (request: {
    body: unknown;
    query: unknown;
    params: unknown;
  }) => ({
    body: request.body ?? null,
    query: request.query,
    params: request.params,
  });

  app.post("/api/auth/login", { schema: authCredentialsRouteSchema }, echo);
  app.post("/api/auth/setup", { schema: authCredentialsRouteSchema }, echo);
  app.post("/api/posts", { schema: createPostRouteSchema }, echo);
  app.put("/api/posts/:id", { schema: updatePostRouteSchema }, echo);
  app.delete("/api/posts/:id", { schema: postIdRouteSchema }, echo);
  app.get("/api/posts/:id", { schema: postIdRouteSchema }, echo);
  app.get("/posts/:id", { schema: postIdRouteSchema }, echo);
  app.get("/api/feed", { schema: defaultPageRouteSchema }, echo);
  app.get("/api/timeline", { schema: defaultPageRouteSchema }, echo);
  app.put("/api/profile", { schema: updateProfileRouteSchema }, echo);
  app.delete("/api/account", { schema: deleteAccountRouteSchema }, echo);
  app.get("/media/*", { schema: mediaKeyRouteSchema }, echo);
  app.delete(
    "/api/media/attachment",
    { schema: deleteAttachmentRouteSchema },
    echo,
  );
  app.post("/api/interact", { schema: interactionRouteSchema }, echo);
  app.delete("/api/interact", { schema: interactionRouteSchema }, echo);
  app.post("/api/follow", { schema: actorUriRouteSchema }, echo);
  app.delete("/api/follow", { schema: actorUriRouteSchema }, echo);
  app.post("/api/search-user", { schema: searchUserRouteSchema }, echo);
  app.get("/api/followers", { schema: defaultPageRouteSchema }, echo);
  app.get("/api/following", { schema: defaultPageRouteSchema }, echo);
  app.get("/api/follow-requests", { schema: defaultPageRouteSchema }, echo);
  app.post(
    "/api/follow-requests/:id/approve",
    { schema: followRequestIdRouteSchema },
    echo,
  );
  app.delete(
    "/api/follow-requests/:id",
    { schema: followRequestIdRouteSchema },
    echo,
  );
  app.get("/outbox", { schema: optionalPageRouteSchema }, echo);
  app.get("/following", { schema: optionalPageRouteSchema }, echo);
  app.get("/followers", { schema: optionalPageRouteSchema }, echo);
  app.get("/.well-known/webfinger", { schema: webFingerRouteSchema }, echo);

  await app.ready();
  return app;
}

describe("route JSON schemas", () => {
  let app: FastifyInstance;

  before(async () => {
    app = await buildSchemaApp();
  });

  it("boots a schema-only server", () => {
    assert.ok(app);
  });

  it("rejects login and setup bodies that omit credentials", async () => {
    for (const url of ["/api/auth/login", "/api/auth/setup"]) {
      const response = await app.inject({
        method: "POST",
        url,
        payload: { username: "ada" },
      });
      assert.equal(response.statusCode, 400);
      assert.match(response.json().error, /password/i);
    }
  });

  it("rejects blank credentials", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/api/auth/login",
      payload: { username: "", password: "secret" },
    });
    assert.equal(response.statusCode, 400);
    assert.match(response.json().error, /username/i);
  });

  it("accepts a credentials body", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/api/auth/setup",
      payload: { username: "ada", password: "secret" },
    });
    assert.equal(response.statusCode, 200);
    assert.deepEqual(response.json().body, {
      username: "ada",
      password: "secret",
    });
  });

  it("rejects empty or whitespace-only post content", async () => {
    for (const content of ["", "   ", "\n\t"]) {
      const response = await app.inject({
        method: "POST",
        url: "/api/posts",
        payload: { content },
      });
      assert.equal(
        response.statusCode,
        400,
        `content ${JSON.stringify(content)}`,
      );
      assert.match(response.json().error, /content/i);
    }
  });

  it("accepts a post with content, reply target, and media", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/api/posts",
      payload: {
        content: " hello ",
        inReplyTo: "https://example.com/posts/1",
        mediaItems: [
          { url: "https://cdn.example/a.png", mimeType: "image/png" },
        ],
      },
    });
    assert.equal(response.statusCode, 200);
  });

  it("rejects a media item that is missing a url", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/api/posts",
      payload: {
        content: "photo",
        mediaItems: [{ mimeType: "image/png" }],
      },
    });
    assert.equal(response.statusCode, 400);
  });

  it("rejects a post id that is not a uuid", async () => {
    const response = await app.inject({
      method: "PUT",
      url: "/api/posts/not-a-uuid",
      payload: { content: "updated" },
    });
    assert.equal(response.statusCode, 400);
    assert.match(response.json().error, /id/i);
  });

  it("accepts an update for a uuid post id", async () => {
    const response = await app.inject({
      method: "PUT",
      url: `/api/posts/${POST_ID}`,
      payload: { content: "updated" },
    });
    assert.equal(response.statusCode, 200);
    assert.equal(response.json().params.id, POST_ID);
  });

  it("validates post id params on read and delete", async () => {
    const bad = await app.inject({ method: "GET", url: "/posts/1" });
    assert.equal(bad.statusCode, 400);

    const removed = await app.inject({
      method: "DELETE",
      url: `/api/posts/${POST_ID}`,
    });
    assert.equal(removed.statusCode, 200);

    const good = await app.inject({
      method: "GET",
      url: `/api/posts/${POST_ID}`,
    });
    assert.equal(good.statusCode, 200);
  });

  it("defaults a missing timeline page to 1 and rejects page < 1", async () => {
    const missing = await app.inject({ method: "GET", url: "/api/timeline" });
    assert.equal(missing.statusCode, 200);
    assert.equal(missing.json().query.page, 1);

    const zero = await app.inject({ method: "GET", url: "/api/feed?page=0" });
    assert.equal(zero.statusCode, 400);
    assert.match(zero.json().error, /page/i);

    const text = await app.inject({
      method: "GET",
      url: "/api/followers?page=abc",
    });
    assert.equal(text.statusCode, 400);
  });

  it("coerces a present page query into an integer", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/api/follow-requests?page=2",
    });
    assert.equal(response.statusCode, 200);
    assert.equal(response.json().query.page, 2);
  });

  it("allows a missing collection page and rejects an invalid one", async () => {
    const missing = await app.inject({ method: "GET", url: "/outbox" });
    assert.equal(missing.statusCode, 200);
    assert.equal(missing.json().query.page, undefined);

    const page = await app.inject({ method: "GET", url: "/followers?page=3" });
    assert.equal(page.statusCode, 200);
    assert.equal(page.json().query.page, 3);

    const bad = await app.inject({ method: "GET", url: "/following?page=-1" });
    assert.equal(bad.statusCode, 400);
  });

  it("requires a non-blank display name and a password to delete an account", async () => {
    const profile = await app.inject({
      method: "PUT",
      url: "/api/profile",
      payload: { displayName: "   " },
    });
    assert.equal(profile.statusCode, 400);

    const named = await app.inject({
      method: "PUT",
      url: "/api/profile",
      payload: { displayName: "Ada", summary: "" },
    });
    assert.equal(named.statusCode, 200);

    const account = await app.inject({
      method: "DELETE",
      url: "/api/account",
      payload: {},
    });
    assert.equal(account.statusCode, 400);
    assert.match(account.json().error, /password/i);
  });

  it("rejects unsafe media keys and keys outside posts/", async () => {
    const traversal = await app.inject({
      method: "GET",
      url: "/media/posts/..hidden",
    });
    assert.equal(traversal.statusCode, 400);

    const ok = await app.inject({
      method: "GET",
      url: "/media/posts/a.png",
    });
    assert.equal(ok.statusCode, 200);
    assert.equal(ok.json().params["*"], "posts/a.png");

    const missing = await app.inject({
      method: "DELETE",
      url: "/api/media/attachment",
      payload: {},
    });
    assert.equal(missing.statusCode, 400);

    const avatar = await app.inject({
      method: "DELETE",
      url: "/api/media/attachment",
      payload: { key: "avatars/a.png" },
    });
    assert.equal(avatar.statusCode, 400);

    const attachment = await app.inject({
      method: "DELETE",
      url: "/api/media/attachment",
      payload: { key: "posts/a.png" },
    });
    assert.equal(attachment.statusCode, 200);
  });

  it("accepts only like or boost interactions with a target uri", async () => {
    const bad = await app.inject({
      method: "POST",
      url: "/api/interact",
      payload: { action: "share", targetPostUri: "https://example.com/p/1" },
    });
    assert.equal(bad.statusCode, 400);

    const missing = await app.inject({
      method: "DELETE",
      url: "/api/interact",
      payload: { action: "like" },
    });
    assert.equal(missing.statusCode, 400);

    const good = await app.inject({
      method: "POST",
      url: "/api/interact",
      payload: { action: "boost", targetPostUri: "https://example.com/p/1" },
    });
    assert.equal(good.statusCode, 200);
  });

  it("requires an actor uri and a handle that contains @", async () => {
    const follow = await app.inject({
      method: "POST",
      url: "/api/follow",
      payload: {},
    });
    assert.equal(follow.statusCode, 400);

    const unfollow = await app.inject({
      method: "DELETE",
      url: "/api/follow",
      payload: { actorUri: "https://remote.example/users/ada" },
    });
    assert.equal(unfollow.statusCode, 200);

    const handle = await app.inject({
      method: "POST",
      url: "/api/search-user",
      payload: { handle: "ada" },
    });
    assert.equal(handle.statusCode, 400);

    const found = await app.inject({
      method: "POST",
      url: "/api/search-user",
      payload: { handle: "@ada@example.com" },
    });
    assert.equal(found.statusCode, 200);
  });

  it("requires a uuid on follow-request routes", async () => {
    const bad = await app.inject({
      method: "POST",
      url: "/api/follow-requests/nope/approve",
    });
    assert.equal(bad.statusCode, 400);

    const good = await app.inject({
      method: "DELETE",
      url: `/api/follow-requests/${POST_ID}`,
    });
    assert.equal(good.statusCode, 200);
  });

  it("requires a webfinger resource that starts with acct:", async () => {
    const missing = await app.inject({
      method: "GET",
      url: "/.well-known/webfinger",
    });
    assert.equal(missing.statusCode, 400);
    assert.match(missing.json().error, /resource/i);

    const invalid = await app.inject({
      method: "GET",
      url: "/.well-known/webfinger?resource=ada@example.com",
    });
    assert.equal(invalid.statusCode, 400);

    const valid = await app.inject({
      method: "GET",
      url: "/.well-known/webfinger?resource=acct:ada@example.com",
    });
    assert.equal(valid.statusCode, 200);
    assert.equal(valid.json().query.resource, "acct:ada@example.com");
  });
});
