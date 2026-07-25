import sharp from "sharp";
import { DOMAIN, S3_BUCKET } from "../config/env.js";
import { resizeImage, uploadBuffer } from "./utils.js";
import s3 from "./s3.js";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";

const STORAGE_BASE_URL = `https://${DOMAIN}/api/media`;

export interface UploadedFile {
  key: string;
  url: string;
  width: number;
  height: number;
  size: number;
  mimeType: string;
}

export const uploadAvatar = async (buffer: Buffer): Promise<UploadedFile> => {
  const resized = await resizeImage(buffer, 256, 256);

  if (!resized) {
    throw new Error("Failed to resize image");
  }

  await uploadBuffer("avatars/avatar.webp", resized, "image/webp");

  return {
    key: "avatars/avatar.webp",
    url: `${STORAGE_BASE_URL}/avatars/avatar.webp`,
    width: 256,
    height: 256,
    size: resized.length,
    mimeType: "image/webp",
  };
};

export const uploadBanner = async (buffer: Buffer): Promise<UploadedFile> => {
  const resized = await resizeImage(buffer, 1500, 500);

  if (!resized) {
    throw new Error("Failed to resize image");
  }

  await uploadBuffer("banners/banner.webp", resized, "image/webp");

  return {
    key: "banners/banner.webp",
    url: `${STORAGE_BASE_URL}/banners/banner.webp`,
    width: 1500,
    height: 500,
    size: resized.length,
    mimeType: "image/webp",
  };
};

export const uploadPostAttachment = async (
  buffer: Buffer,
): Promise<UploadedFile> => {
  const image = sharp(buffer);
  const metadata = await image.metadata();

  const resized = await image
    .resize({
      width: 1600,
      withoutEnlargement: true,
    })
    .webp({
      quality: 85,
    })
    .toBuffer();

  if (!resized) {
    throw new Error("Failed to resize image");
  }

  const filename = `${crypto.randomUUID()}.webp`;

  const now = new Date();

  const key = `posts/${now.getFullYear()}/${String(now.getMonth() + 1).padStart(
    2,
    "0",
  )}/${filename}`;

  await uploadBuffer(key, resized, "image/webp");

  return {
    key,
    url: `${STORAGE_BASE_URL}/${key}`,
    width: metadata.width ?? 0,
    height: metadata.height ?? 0,
    size: resized.length,
    mimeType: "image/webp",
  };
};

export const deleteFile = async (key: string) => {
  await s3.send(new DeleteObjectCommand({ Bucket: S3_BUCKET, Key: key }));
};
