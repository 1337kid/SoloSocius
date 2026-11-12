import { FastifyRequest, FastifyReply } from "fastify";
import { splitSignatureHeader, verifySignature } from "../utils/signature.js";
import { remoteFetch } from "../utils/activitypub.js";

export const verifyIncomingSignature = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  const headers = request.headers;
  const signatureHeader = headers["signature"] as string;

  if (!signatureHeader) {
    console.log(
      "[verifyIncomingSignature] Missing compulsory HTTP Signature header",
    );
    return reply
      .status(401)
      .send({ error: "Missing compulsory HTTP Signature header" });
  }

  const parts = splitSignatureHeader(signatureHeader);

  const { keyId, headers: signedHeadersList, signature } = parts;

  if (!keyId || !signedHeadersList || !signature) {
    console.log(
      "[verifyIncomingSignature] Malformed or incomplete Signature attributes.",
    );
    return reply
      .status(400)
      .send({ error: "Malformed or incomplete Signature attributes." });
  }

  try {
    const headerKeys = signedHeadersList.split(" ");
    const comparisonLines: string[] = [];

    for (const key of headerKeys) {
      if (key == "(request-target)") {
        comparisonLines.push(
          `(request-target): ${request.method.toLowerCase()} ${request.url}`,
        );
      } else {
        const value = headers[key];
        if (value === undefined) {
          console.log(
            `[verifyIncomingSignature] Signed header component "${key}" missing from request.`,
          );
          return reply.status(400).send({
            error: `Signed header component "${key}" missing from request.`,
          });
        }
        comparisonLines.push(`${key}: ${value}`);
      }
    }

    const comparisonString = comparisonLines.join("\n");

    const keyLookupResponse = await remoteFetch(keyId);

    if (!keyLookupResponse.ok) {
      console.log(
        "[verifyIncomingSignature] Failed to safely retrieve remote actor key identity profile.",
      );
      return reply.status(401).send({
        error: "Failed to safely retrieve remote actor key identity profile.",
      });
    }

    const remoteActor = (await keyLookupResponse.json()) as any;

    const remoteActorPublicKeyPem = remoteActor?.publicKey?.publicKeyPem;

    if (!remoteActorPublicKeyPem) {
      console.log(
        "[verifyIncomingSignature] Remote actor does not expose a valid public key.",
      );
      return reply.status(401).send({
        error: "Remote actor does not expose a valid public key.",
      });
    }

    const isValid = verifySignature({
      publicKeyPem: remoteActorPublicKeyPem,
      signature,
      comparisonString,
    });

    if (!isValid) {
      console.log(
        "[verifyIncomingSignature] Cryptographic signature mismatch! Request dropped.",
      );
      return reply
        .status(401)
        .send({ error: "Cryptographic signature mismatch! Request dropped." });
    }

    (request as any).remoteActorUri = remoteActor.id;
  } catch (error) {
    console.log(
      "[verifyIncomingSignature] Signature handshake tracking encountered an internal error.",
    );
    return reply.status(500).send({
      error: "Signature handshake tracking encountered an internal error.",
    });
  }
};
