import { PutObjectCommand } from "@aws-sdk/client-s3";
import s3 from "./s3.js";
import { S3_BUCKET } from "../config/env.js";
import sharp from "sharp";

export const uploadBuffer = async (
  key: string,
  body: Buffer,
  contentType: string,
) => {
  await s3.send(
    new PutObjectCommand({
      Bucket: S3_BUCKET,
      Key: key,
      Body: body,
      ContentType: contentType,
    }),
  );
};

export const resizeImage = async (
  buffer: Buffer,
  width: number,
  height: number,
) => {
  const image = sharp(buffer);

  const resized = await image
    .resize(width, height, {
      fit: "cover",
    })
    .webp({
      quality: 85,
    })
    .toBuffer();

  return resized;
};
