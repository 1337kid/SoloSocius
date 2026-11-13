import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { TimelineItem, TimelineResponse } from "@solosocius/api-types";
import { applyStreamEvent, uniqueTimelineItems } from "./apply-stream-event";

function item(
  overrides: Partial<TimelineItem> & {
    postId: string;
    eventType?: "post" | "boost";
    actorUri?: string;
  },
): TimelineItem {
  const { postId, eventType = "post", actorUri = "https://local.example/users/me" } =
    overrides;
  return {
    event: { createdAt: "2020-01-01T00:00:00.000Z", type: eventType },
    actor: {
      actorUri,
      username: "me",
      domain: "local.example",
      displayName: null,
      avatarUrl: null,
    },
    post: {
      id: postId,
      idUri: `https://local.example/posts/${postId}`,
      url: null,
      content: overrides.post?.content ?? "hello",
      createdAt: "2020-01-01T00:00:00.000Z",
      likeCount: overrides.post?.likeCount ?? 0,
      boostCount: 0,
      replyCount: 0,
      liked: false,
      boosted: false,
      actor: {
        actorUri,
        username: "me",
        domain: "local.example",
        displayName: null,
        avatarUrl: null,
      },
      mediaItems: null,
      inReplyTo: null,
    },
  };
}

function cache(items: TimelineItem[]): {
  pages: TimelineResponse[];
  pageParams: number[];
} {
  return {
    pages: [
      { page: 1, limit: 20, count: items.length, nextPage: null, items },
    ],
    pageParams: [1],
  };
}

describe("applyStreamEvent", () => {
  it("prepends an update onto the first page and skips duplicates", () => {
    const existing = item({ postId: "old" });
    const fresh = item({ postId: "new", post: { content: "fresh" } as TimelineItem["post"] });
    const current = cache([existing]);

    const added = applyStreamEvent(current, { event: "update", payload: fresh });
    assert.equal(added?.pages[0].items[0].post.id, "new");
    assert.equal(added?.pages[0].items[1].post.id, "old");
    assert.equal(added?.pages[0].count, 2);

    const again = applyStreamEvent(added, { event: "update", payload: fresh });
    assert.equal(again?.pages[0].items.length, 2);
  });

  it("patches a status update across pages by post id", () => {
    const first = item({ postId: "p1" });
    const boost = item({
      postId: "p1",
      eventType: "boost",
      actorUri: "https://remote.example/users/bob",
    });
    const current = {
      pages: [
        { page: 1, limit: 20, count: 1, nextPage: 2, items: [first] },
        { page: 2, limit: 20, count: 1, nextPage: null, items: [boost] },
      ],
      pageParams: [1, 2],
    };
    const edited = item({
      postId: "p1",
      post: { content: "edited", likeCount: 4 } as TimelineItem["post"],
    });

    const next = applyStreamEvent(current, {
      event: "status.update",
      payload: edited,
    });

    assert.equal(next?.pages[0].items[0].post.content, "edited");
    assert.equal(next?.pages[0].items[0].post.likeCount, 4);
    assert.equal(next?.pages[0].items[0].event.type, "post");
    assert.equal(next?.pages[1].items[0].post.content, "edited");
    assert.equal(next?.pages[1].items[0].event.type, "boost");
    assert.equal(
      next?.pages[1].items[0].actor.actorUri,
      "https://remote.example/users/bob",
    );
  });

  it("removes a deleted post everywhere and a boost only from that row", () => {
    const post = item({ postId: "p1" });
    const boost = item({
      postId: "p1",
      eventType: "boost",
      actorUri: "https://remote.example/users/bob",
    });
    const other = item({ postId: "p2" });
    const current = cache([post, boost, other]);

    const withoutBoost = applyStreamEvent(current, {
      event: "delete",
      payload: {
        postId: "p1",
        eventType: "boost",
        actorUri: "https://remote.example/users/bob",
      },
    });
    assert.deepEqual(
      withoutBoost?.pages[0].items.map((entry) => entry.event.type),
      ["post", "post"],
    );

    const withoutPost = applyStreamEvent(withoutBoost, {
      event: "delete",
      payload: {
        postId: "p1",
        eventType: "post",
        actorUri: "https://local.example/users/me",
      },
    });
    assert.deepEqual(
      withoutPost?.pages[0].items.map((entry) => entry.post.id),
      ["p2"],
    );
  });

  it("collapses rows repeated when a later page overlaps the first", () => {
    const shared = item({ postId: "shifted" });
    const fresh = item({ postId: "live" });
    const older = item({ postId: "older" });

    const visible = uniqueTimelineItems([fresh, shared, shared, older]);

    assert.deepEqual(
      visible.map((entry) => entry.post.id),
      ["live", "shifted", "older"],
    );
  });

  it("leaves an unloaded cache untouched", () => {
    const fresh = item({ postId: "new" });
    assert.equal(
      applyStreamEvent(undefined, { event: "update", payload: fresh }),
      undefined,
    );
  });
});
