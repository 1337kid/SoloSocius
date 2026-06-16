import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema.js";
import { DATABASE_URL } from "../config/env.js";

const queryClient = postgres(DATABASE_URL);
export const db = drizzle(queryClient, { schema });
