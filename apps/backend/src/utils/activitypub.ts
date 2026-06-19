import { createHash } from "crypto";
import { DeliverParams } from "../types/index.js";
import { createSignature } from "./signature.js";
import axios from "axios";
import axiosRetry from "axios-retry";
import { DOMAIN } from "../config/env.js";
import { getUserPrivateKey } from "../db/queries/users.js";
import { getAllFollowers } from "../db/queries/followers.js";
import { userEndpoints } from "../activitypub/actor.js";

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
  const userFollowers = await getAllFollowers();

  if (userFollowers.length > 0) {
    const uniqueDeliveryInboxes = new Set<string>();
    for (const follower of userFollowers) {
      uniqueDeliveryInboxes.add(follower.sharedInboxUrl || follower.inboxUrl);
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
