import { S3Client } from "@aws-sdk/client-s3";
import {
  S3_ENDPOINT,
  S3_REGION,
  S3_ACCESS_KEY,
  S3_SECRET_KEY,
} from "../config/env.js";

const s3 = new S3Client({
  endpoint: S3_ENDPOINT!,
  region: S3_REGION!,
  forcePathStyle: true,
  credentials: {
    accessKeyId: S3_ACCESS_KEY!,
    secretAccessKey: S3_SECRET_KEY!,
  },
});

export default s3;
