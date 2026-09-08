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
import type { MediaItem } from "../db/schema.js";

type SignatureParams = {
  url: string;
  method: "GET" | "POST";
  body?: string;
  keyId: string;
};

type SignatureResult = {
  host: string;
  date: string;
  digest?: string;
  signature: string;
};

const axiosClient = axios.create({ timeout: 10000 });

axiosRetry(axiosClient, {
  retries: Infinity,
  retryCondition: (error) => {
    return (
      axiosRetry.isNetworkOrIdempotentRequestError(error) ||
      (error.response ? error.response.status >= 500 : false)
    );
  },
  retryDelay: (retryCount) => {
    return Math.min(axiosRetry.exponentialDelay(retryCount), 30_000);
  },
  onRetry: (retryCount, error, requestConfig) => {
    console.warn(
      `Request failed. Attempt #${retryCount} to retry tracking path: ${requestConfig.url}`,
    );
  },
});

export const remoteFetch = async (destination: string, accept?: string) => {
  const keyId = `${userEndpoints.actorUri}#main-key`;

  const signatureParams = await generateSignature({
    url: destination,
    method: "GET",
    keyId,
  });

  return fetch(destination, {
    method: "GET",
    headers: {
      Accept: accept || "application/activity+json",
      Host: signatureParams.host,
      Date: signatureParams.date,
      Signature: signatureParams.signature,
    },
  });
};
export const webfingerLookup = async (domain: string, handle: string) => {
  return await remoteFetch(
    `https://${domain}/.well-known/webfinger?resource=acct:${handle}`,
    "application/jrd+json",
  );
};

export const remoteActorLookup = async (actorUri: string) => {
  const actor = await getActorFromDB(actorUri);
  if (actor) return actor;

  const remoteActor = await remoteFetch(actorUri, "application/json");
  console.log("remoteActor", remoteActor);

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
    manuallyApprovesFollowers: data.manuallyApprovesFollowers || false,
  });

  return newActor;
};

export const parseMediaItems = (attachment: any) => {
  let mediaItems: MediaItem[] = [];
  for (const mediaItem of attachment || []) {
    mediaItems.push({
      url: mediaItem.url,
      mimeType: mediaItem.mediaType,
    });
  }
  return mediaItems;
};

export const remotePostLookup = async (postUri: string) => {
  const post = await getPostFromDB(postUri);

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

  let mediaItems: MediaItem[] = parseMediaItems(data.attachment);

  const newPost = await storeRemotePost({
    actorUri: data.attributedTo,
    idUri: postUri,
    content: data.content,
    inReplyTo: inReplyToPost?.idUri || null,
    url: data.url,
    published: data.published,
    mediaItems,
  });
  return newPost;
};

const generateSignature = async ({
  url,
  method,
  body,
  keyId,
}: SignatureParams): Promise<SignatureResult> => {
  const urlObj = new URL(url);
  const privateKeyPem = await getUserPrivateKey();
  const targetPath = urlObj.pathname + urlObj.search;
  const targetHost = urlObj.host;
  const dateHeader = new Date().toUTCString();

  const signFields = [
    `(request-target): ${method.toLowerCase()} ${targetPath}`,
    `host: ${targetHost}`,
    `date: ${dateHeader}`,
  ];

  let digestHeader: string | undefined;

  if (body !== undefined) {
    const digestHash = createHash("sha256").update(body).digest("base64");
    digestHeader = `SHA-256=${digestHash}`;
    signFields.push(`digest: ${digestHeader}`);
  }

  const comparisonString = signFields.join("\n");
  const signatureString = createSignature(comparisonString, privateKeyPem);

  const signedHeaders = [
    "(request-target)",
    "host",
    "date",
    ...(digestHeader ? ["digest"] : []),
  ];

  const signatureHeader =
    `keyId="${keyId}",` +
    `algorithm="rsa-sha256",` +
    `headers="${signedHeaders.join(" ")}",` +
    `signature="${signatureString}"`;

  return {
    host: targetHost,
    date: dateHeader,
    ...(digestHeader && { digest: digestHeader }),
    signature: signatureHeader,
  };
};

export const deliverActivity = async (params: DeliverParams) => {
  const { inboxUrl, activity } = params;
  const keyId = `${userEndpoints.actorUri}#main-key`;
  const bodyString = JSON.stringify(activity);

  const signatureParams = await generateSignature({
    url: inboxUrl,
    method: "POST",
    body: bodyString,
    keyId,
  });

  try {
    const response = await axiosClient.post(inboxUrl, bodyString, {
      headers: {
        Host: signatureParams.host,
        Date: signatureParams.date,
        Digest: signatureParams.digest,
        Signature: signatureParams.signature,
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

export const parseAttachmentsForActivity = (attachments: MediaItem[]) => {
  return attachments.map((attachment) => {
    return {
      type: "Image",
      mediaType: attachment.mimeType,
      url: attachment.url,
    };
  });
};
