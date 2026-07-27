import { FastifyReply, FastifyRequest } from "fastify";
import { getPublicMediaUrl } from "../storage/utils.js";
import {
  uploadAvatar,
  uploadBanner,
  uploadPostAttachment,
  deleteFile,
} from "../storage/storageService.js";
import { storeMediaRecord, deleteMediaRecord } from "../db/queries/media.js";
import {
  getActorOnThisInstance,
  updateLocalActorAvatar,
  updateLocalActorBanner,
} from "../db/queries/actor.js";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
];

async function readMultipartFile(req: FastifyRequest): Promise<{
  buffer: Buffer;
  mimeType: string;
  filename: string;
} | null> {
  const data = await req.file({ limits: { fileSize: MAX_FILE_SIZE } });
  if (!data) return null;

  const mimeType = data.mimetype;
  if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
    throw Object.assign(new Error("Unsupported file type"), {
      statusCode: 415,
    });
  }

  const chunks: Buffer[] = [];
  for await (const chunk of data.file) {
    chunks.push(chunk);
  }

  if (data.file.truncated) {
    throw Object.assign(new Error("File too large (max 10 MB)"), {
      statusCode: 413,
    });
  }

  return {
    buffer: Buffer.concat(chunks),
    mimeType,
    filename: data.filename,
  };
}

export async function getMedia(req: FastifyRequest, res: FastifyReply) {
  const key = (req.params as { [key: string]: string })["*"];

  if (!key) {
    return res.code(400).send({ error: "Missing media key" });
  }

  if (key.includes("..") || key.startsWith("/") || key.startsWith("\\")) {
    return res.code(400).send({ error: "Invalid media key" });
  }

  const url = getPublicMediaUrl(key);
  res.header("Cache-Control", "public, max-age=31536000, immutable");
  return res.code(301).redirect(url);
}

export async function uploadAvatarHandler(
  req: FastifyRequest,
  res: FastifyReply,
) {
  const file = await readMultipartFile(req);
  if (!file) {
    return res.code(400).send({ error: "No file provided" });
  }

  const actor = await getActorOnThisInstance();
  if (!actor) {
    return res.code(404).send({ error: "Local actor not found" });
  }

  const avatarKey = "profile/avatar.webp";
  await deleteFile(avatarKey);
  await deleteMediaRecord(avatarKey);

  const uploaded = await uploadAvatar(file.buffer);

  await storeMediaRecord({
    key: uploaded.key,
    size: uploaded.size,
    mimeType: uploaded.mimeType,
  });

  await updateLocalActorAvatar(uploaded.url);

  return res.code(200).send({
    key: uploaded.key,
    url: uploaded.url,
    width: uploaded.width,
    height: uploaded.height,
    mimeType: uploaded.mimeType,
  });
}

export async function uploadBannerHandler(
  req: FastifyRequest,
  res: FastifyReply,
) {
  const file = await readMultipartFile(req);
  if (!file) {
    return res.code(400).send({ error: "No file provided" });
  }

  const actor = await getActorOnThisInstance();
  if (!actor) {
    return res.code(404).send({ error: "Local actor not found" });
  }

  const bannerKey = "profile/banner.webp";
  await deleteFile(bannerKey);
  await deleteMediaRecord(bannerKey);

  const uploaded = await uploadBanner(file.buffer);

  await storeMediaRecord({
    key: uploaded.key,
    size: uploaded.size,
    mimeType: uploaded.mimeType,
  });

  await updateLocalActorBanner(uploaded.url);

  return res.code(200).send({
    key: uploaded.key,
    url: uploaded.url,
    width: uploaded.width,
    height: uploaded.height,
    mimeType: uploaded.mimeType,
  });
}

export async function uploadAttachmentHandler(
  req: FastifyRequest,
  res: FastifyReply,
) {
  const file = await readMultipartFile(req);
  if (!file) {
    return res.code(400).send({ error: "No file provided" });
  }

  const uploaded = await uploadPostAttachment(file.buffer);

  await storeMediaRecord({
    key: uploaded.key,
    size: uploaded.size,
    mimeType: uploaded.mimeType,
  });

  return res.code(201).send({
    key: uploaded.key,
    url: uploaded.url,
    width: uploaded.width,
    height: uploaded.height,
    mimeType: uploaded.mimeType,
  });
}

export async function deleteAttachmentHandler(
  req: FastifyRequest,
  res: FastifyReply,
) {
  const { key } = req.body as { key?: string };
  if (!key) {
    return res.code(400).send({ error: "Missing key" });
  }

  if (!key.startsWith("posts/")) {
    return res.code(403).send({ error: "Can only delete post attachments" });
  }

  await deleteFile(key);
  await deleteMediaRecord(key);

  return res.code(200).send({ success: true });
}
