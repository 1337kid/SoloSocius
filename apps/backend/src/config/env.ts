import { config } from "dotenv";

config();

if (!process.env.DATABASE_URL) {
  throw new Error("CRITICAL: DATABASE_URL environment variable is missing.");
}

export const DATABASE_URL = process.env.DATABASE_URL;
export const DOMAIN = process.env.DOMAIN || "localhost:3001";
export const PORT = Number(process.env.PORT) || 4000;
export const NODE_ENV =
  (process.env.NODE_ENV as "development" | "production") || "development";
export const JWT_SECRET = process.env.JWT_SECRET || "jwt-secret";

export const S3_ENDPOINT = process.env.S3_ENDPOINT;
export const S3_REGION = process.env.S3_REGION;
export const S3_BUCKET = process.env.S3_BUCKET;
export const S3_ACCESS_KEY = process.env.S3_ACCESS_KEY;
export const S3_SECRET_KEY = process.env.S3_SECRET_KEY;
