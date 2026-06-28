import { createHash } from "crypto";
import { DeliverParams } from "../types/index.js";
import { createSignature } from "./signature.js";
import axios from "axios";
import axiosRetry from "axios-retry";
import { getUserPrivateKey } from "../db/queries/users.js";
import { getAllFollowersInbox } from "../db/queries/followers.js";
import { userEndpoints } from "../activitypub/actor.js";
import { addActorToDB, getActorFromDB } from "../db/queries/actor.js";
import { getPostFromDB, storeRemotePost } from "../db/queries/posts.js";

const axiosClient = axios.create({ timeout: 10000 });

axiosRetry(axiosClient, {
  retries: 5,
  retryCondition: (error) => {
    return (
      axiosRetry.isNetworkOrIdempotentRequestError(error) ||
      (error.response ? error.response.status >= 500 : false)
    );
  },
  retryDelay: (retryCount) => {
    return axiosRetry.exponentialDelay(retryCount);
  },
  onRetry: (retryCount, error, requestConfig) => {
    console.warn(
      `Request failed. Attempt #${retryCount} to retry tracking path: ${requestConfig.url}`,
    );
  },
});

export const remoteFetch = async (destination: string) => {
  return await fetch(destination, {
    headers: { Accept: "application/activity+json" },
  });
};

export const webfingerLookup = async (domain: string, handle: string) => {
  return await remoteFetch(
    `https://${domain}/.well-known/webfinger?resource=acct:${handle}`,
  );
};

export const remoteActorLookup = async (actorUri: string) => {
  const actor = await getActorFromDB(actorUri);
  if (actor) return actor;

  const remoteActor = await remoteFetch(actorUri);
  if (!remoteActor.ok)
    throw new Error("Could not discover target remote profile path.");

  const data = await remoteActor.json();
  const newActor = await addActorToDB({
    actorUri: actorUri,
    username: data.preferredUsername,
    domain: new URL(actorUri).hostname,
    displayName: data.name,
    summary: data.summary || data.bio,
    avatarUrl: data.icon?.url ?? "",
    bannerUrl: data.image?.url ?? "",
    publicKeyId: data.publicKey?.id,
    publicKey: data.publicKey?.publicKeyPem,
    inboxUrl: data.inbox,
    sharedInboxUrl: data.endpoints?.sharedInbox || data.inbox,
  });

  return newActor;
};

export const remotePostLookup = async (postUri: string) => {
  const post = await getPostFromDB(postUri);
  console.log("post", post);
  if (post) return post;


  const lookup = await remoteFetch(postUri);

  if (!lookup.ok)
    throw new Error("Could not discover target remote post path.");

  const data = await lookup.json();

  console.log("data", data);

  await remoteActorLookup(data.attributedTo);

  let inReplyToPost = null;

  if (data.inReplyTo) {
    inReplyToPost = await getPostFromDB(data.inReplyTo);

    if (!inReplyToPost) {
      inReplyToPost = await remotePostLookup(data.inReplyTo);
    }
  }

  const newPost = await storeRemotePost({
    actorUri: data.attributedTo,
    idUri: postUri,
    content: data.content,
    inReplyTo: inReplyToPost?.idUri || null,
    url: data.url,
    published: data.published,
  });
  return newPost;
};

export const deliverActivity = async (params: DeliverParams) => {
  const { inboxUrl, activity } = params;
  const privateKeyPem = await getUserPrivateKey();

  const keyId = `${userEndpoints.actorUri}#main-key`;

  const urlObj = new URL(inboxUrl);
  const targetPath = urlObj.pathname + urlObj.search;
  const targetHost = urlObj.host;

  const bodyString = JSON.stringify(activity);
  const digestHash = createHash("sha256").update(bodyString).digest("base64");
  const digestHeader = `SHA-256=${digestHash}`;
  const dateHeader = new Date().toUTCString();

  const signField = [
    `(request-target): post ${targetPath}`,
    `host: ${targetHost}`,
    `date: ${dateHeader}`,
    `digest: ${digestHeader}`,
  ];

  const comparisonString = signField.join("\n");

  const signatureString = createSignature(comparisonString, privateKeyPem);
  const signatureHeader = `keyId="${keyId}",algorithm="rsa-sha256",headers="(request-target) host date digest",signature="${signatureString}"`;

  try {
    const response = await axiosClient.post(inboxUrl, bodyString, {
      headers: {
        Host: targetHost,
        Date: dateHeader,
        Digest: digestHeader,
        Signature: signatureHeader,
        "Content-Type": "application/activity+json",
        Accept: "application/activity+json",
      },
    });

    return response.status >= 200 && response.status < 300;
  } catch (error) {
    console.log("Error in sending activity: ", error);
    return false;
  }
};

export const deliverActivityToFollowers = async (activityPayload: any) => {
  const userFollowers = await getAllFollowersInbox();

  if (userFollowers.length > 0) {
    const uniqueDeliveryInboxes = new Set<string>();
    for (const follower of userFollowers) {
      uniqueDeliveryInboxes.add(
        follower.actor.sharedInboxUrl || follower.actor.inboxUrl,
      );
    }

    Promise.allSettled(
      Array.from(uniqueDeliveryInboxes).map((inboxUrl) => {
        deliverActivity({
          inboxUrl,
          activity: activityPayload,
        });
      }),
    ).then((results) => {
      const deliveredCount = results.filter(
        (r) => r.status === "fulfilled",
      ).length;
      console.log("Status", deliveredCount);
    });
  }
};
