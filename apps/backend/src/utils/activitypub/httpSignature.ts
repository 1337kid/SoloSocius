import { createHash } from "crypto";
import {
  getSystemUserPrivateKey,
  getUserPrivateKey,
} from "../../db/queries/users.js";
import { systemUserEndpoints, userEndpoints } from "../../activitypub/actor.js";
import { createSignature } from "../signature.js";

type SignatureParams = {
  url: string;
  method: "GET" | "POST";
  body?: string;
  isSystemActor: boolean;
};

type SignatureResult = {
  host: string;
  date: string;
  digest?: string;
  signature: string;
};

export const generateSignature = async ({
  url,
  method,
  body,
  isSystemActor,
}: SignatureParams): Promise<SignatureResult> => {
  const urlObj = new URL(url);
  const keyId = isSystemActor
    ? `${systemUserEndpoints.actorUri}#main-key`
    : `${userEndpoints.actorUri}#main-key`;

  const privateKeyPem = isSystemActor
    ? await getSystemUserPrivateKey()
    : await getUserPrivateKey();

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
