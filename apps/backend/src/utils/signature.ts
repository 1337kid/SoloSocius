import { generateKeyPairSync, cryptoSign, createVerify } from "crypto";

export const generateRSAKeyPair = () => {
  const { privateKey, publicKey } = generateKeyPairSync("rsa", {
    modulusLength: 2048,
    publicKeyEncoding: {
      type: "spki",
      format: "pem",
    },
    privateKeyEncoding: {
      type: "pkcs8",
      format: "pem",
    },
  });

  return { privateKey, publicKey };
};

export const verifySignature = (params: {
  publicKeyPem: string;
  signature: string;
  comparisonString: string;
}): boolean => {
  try {
    const verifier = createVerify("sha256");
    verifier.update(Buffer.from(params.comparisonString));
    verifier.end();
    return verifier.verify(params.publicKeyPem, params.signature, "base64");
  } catch (error) {
    return false;
  }
};

export const splitSignatureHeader = (header: string) => {
  return header.split(",").reduce(
    (acc, part) => {
      const [key, value] = part.split("=");
      if (key && value) acc[key.trim()] = value.replace(/"/g, "").trim();
      return acc;
    },
    {} as Record<string, string>,
  );
};