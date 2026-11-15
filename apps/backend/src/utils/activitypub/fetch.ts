import { generateSignature } from "./httpSignature.js";

export const remoteFetch = async (
  destination: string,
  accept: string = "application/activity+json",
) => {
  const signatureParams = await generateSignature({
    url: destination,
    method: "GET",
    isSystemActor: false,
  });

  return fetch(destination, {
    method: "GET",
    headers: {
      Accept: accept,
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
