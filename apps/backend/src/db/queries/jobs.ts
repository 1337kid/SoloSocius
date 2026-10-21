import { db } from "../index.js";
import { jobs } from "../schema.js";
import { and, asc, eq, lte } from "drizzle-orm";

export const fetchPendingJobs = async () => {
  const pendingJobs = await db
    .select()
    .from(jobs)
    .where(and(eq(jobs.status, "pending"), lte(jobs.runAt, new Date())))
    .orderBy(asc(jobs.runAt))
    .limit(5);
  return pendingJobs;
};

export const updateJobStatusAsProcessing = async (jobId: string) => {
  await db
    .update(jobs)
    .set({ status: "processing", updatedAt: new Date() })
    .where(eq(jobs.id, jobId));
};

export const updateJobStatusAsCompleted = async (jobId: string) => {
  await db
    .update(jobs)
    .set({ status: "completed", updatedAt: new Date() })
    .where(eq(jobs.id, jobId));
};

export const updateJob = async (
  jobId: string,
  attempts: number,
  isFailed: boolean,
  runAt: Date,
  error: string,
) => {
  await db
    .update(jobs)
    .set({
      attempts: attempts,
      status: isFailed ? "failed" : "pending",
      lastError: error,
      runAt: runAt,
      updatedAt: new Date(),
    })
    .where(eq(jobs.id, jobId));
};

export const addJobEntry = async (type: string, payload: any) => {
  await db.insert(jobs).values({
    type,
    payload,
  });
};
