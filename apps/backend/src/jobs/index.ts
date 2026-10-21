import {
  addJobEntry,
  fetchPendingJobs,
  updateJob,
  updateJobStatusAsCompleted,
  updateJobStatusAsProcessing,
} from "../db/queries/jobs.js";

import type { DeliverParams } from "../types/index.js";
import { deliverActivity } from "../utils/activitypub.js";

const POLL_INTERVAL_MS = 5000;

class JobWorker {
  private timer: ReturnType<typeof setTimeout> | undefined;
  private isRunning = false;
  private isPolling = false;

  constructor(private readonly pollIntervalMs = POLL_INTERVAL_MS) {}

  public start(): void {
    if (this.isRunning) {
      console.log("[jobs] Worker is already running.");
      return;
    }

    this.isRunning = true;
    console.log("[jobs] Starting background job worker...");

    void this.runLoop();
  }

  public stop(): void {
    this.isRunning = false;

    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = undefined;
    }

    console.log("[jobs] Stopping background job worker...");
  }

  private async runLoop(): Promise<void> {
    if (!this.isRunning) return;

    try {
      await this.processPendingJobs();
    } catch (error) {
      console.error("[jobs] Error executing worker loop:", error);
    } finally {
      if (this.isRunning) {
        this.timer = setTimeout(() => void this.runLoop(), this.pollIntervalMs);
      }
    }
  }

  private async processPendingJobs(): Promise<void> {
    if (this.isPolling) return;

    this.isPolling = true;

    try {
      const pendingJobs = await fetchPendingJobs();

      for (const job of pendingJobs) {
        if (!this.isRunning) break;

        await updateJobStatusAsProcessing(job.id);

        try {
          switch (job.type) {
            case "deliver_activity": {
              const payload = job.payload as DeliverParams;
              await deliverActivity(payload);
              break;
            }

            default:
              throw new Error(`Unsupported job type: ${job.type}`);
          }

          await updateJobStatusAsCompleted(job.id);

          console.log(`[jobs] Job ${job.id} executed successfully.`);
        } catch (error: unknown) {
          const nextAttempt = job.attempts + 1;
          const isFailed = nextAttempt >= job.maxAttempts;

          const backoffDelaySeconds = Math.pow(2, nextAttempt) * 10;

          const nextRunAt = new Date(Date.now() + backoffDelaySeconds * 1000);

          const errorMessage =
            error instanceof Error ? error.message : String(error);

          await updateJob(
            job.id,
            nextAttempt,
            isFailed,
            nextRunAt,
            errorMessage,
          );

          console.error(
            `[jobs] Job ${job.id} attempt ${nextAttempt} failed: ` +
              `${errorMessage}. Next retry scheduled at: ` +
              `${nextRunAt.toISOString()}`,
          );
        }
      }
    } finally {
      this.isPolling = false;
    }
  }

  public async createJob(type: string, payload: unknown): Promise<void> {
    await addJobEntry(type, payload);
  }
}

export const JOB_TYPES = {
  DELIVER_ACTIVITY: "deliver_activity",
} as const;

export default new JobWorker();
