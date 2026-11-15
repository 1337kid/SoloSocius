import axios from "axios";
import axiosRetry from "axios-retry";
import { getAllFollowersInbox } from "../../db/queries/followers.js";
import { listRelays } from "../../db/queries/relays.js";
import jobWorker, { JOB_TYPES } from "../../jobs/index.js";
import { DeliverParams } from "../../types/index.js";
import { generateSignature } from "./httpSignature.js";

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

export const deliverActivity = async (params: DeliverParams) => {
  const { inboxUrl, activity, isSystemActor } = params;
  const bodyString = JSON.stringify(activity);

  const signatureParams = await generateSignature({
    url: inboxUrl,
    method: "POST",
    body: bodyString,
    isSystemActor,
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

    console.log("[deliverActivity] Status: ", response.status);
    console.log("[deliverActivity] Data: ", response.data);
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

    for (const inboxUrl of uniqueDeliveryInboxes) {
      jobWorker.createJob(JOB_TYPES.DELIVER_ACTIVITY, {
        inboxUrl,
        activity: activityPayload,
        isSystemActor: false,
      });
    }
  }
};

export const deliverActivityToRelay = async (activityPayload: any) => {
  const relays = await listRelays();
  for (const relay of relays) {
    jobWorker.createJob(JOB_TYPES.DELIVER_ACTIVITY, {
      inboxUrl: relay.inboxUrl,
      activity: activityPayload,
    });
  }
};
