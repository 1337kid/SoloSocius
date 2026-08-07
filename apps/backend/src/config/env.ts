import { config } from "dotenv";

config();

const requiredEnvVars = [
  "DATABASE_URL",
  "JWT_SECRET",
  "S3_ENDPOINT",
  "S3_REGION",
  "S3_BUCKET",
  "S3_ACCESS_KEY",
  "S3_SECRET_KEY",
  "STORAGE_PUBLIC_MEDIA_URL",
  "REDIS_URL",
];

const missingVars = requiredEnvVars.filter((varName) => !process.env[varName]);

if (missingVars.length > 0) {
  throw new Error(
    `CRITICAL: Missing required environment variables: ${missingVars.join(", ")}`,
  );
}

export const DATABASE_URL = process.env.DATABASE_URL!;
export const DOMAIN = process.env.DOMAIN || "localhost:3001";
export const PORT = Number(process.env.PORT) || 4000;
export const NODE_ENV =
  (process.env.NODE_ENV as "development" | "production") || "development";
export const JWT_SECRET = process.env.JWT_SECRET!;

export const S3_ENDPOINT = process.env.S3_ENDPOINT!;
export const S3_REGION = process.env.S3_REGION!;
export const S3_BUCKET = process.env.S3_BUCKET!;
export const S3_ACCESS_KEY = process.env.S3_ACCESS_KEY!;
export const S3_SECRET_KEY = process.env.S3_SECRET_KEY!;
export const STORAGE_PUBLIC_MEDIA_URL = process.env.STORAGE_PUBLIC_MEDIA_URL!;

export const REDIS_URL = process.env.REDIS_URL!;
