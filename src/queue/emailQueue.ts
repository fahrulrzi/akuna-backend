import { Queue } from "bullmq"; // Hapus QueueScheduler dari sini
import IORedis from "ioredis";
import { config } from "../config/index.js";

const redisUrl =
  process.env.REDIS_URL || config.redis.url || "redis://localhost:6379";
const prefix = config.queuePrefix || process.env.QUEUE_PREFIX || "akuna";

// Setup Connection
const connection = new IORedis(redisUrl, {
  maxRetriesPerRequest: null,
  enableReadyCheck: true,
  retryStrategy(times) {
    return Math.min(2000 + times * 200, 20000);
  },
});

const queueName = "email";

export const emailQueue = new Queue(queueName, {
  connection,
  prefix,
  defaultJobOptions: {
    attempts: Number(process.env.EMAIL_SEND_RETRIES || 3),
    backoff: { type: "exponential", delay: 5000 },
    removeOnComplete: true,
    removeOnFail: false,
  },
});

export interface ResetPasswordJob {
  to: string;
  resetUrl: string;
  userId: number | string;
}

export async function enqueueResetPasswordEmail(payload: ResetPasswordJob) {
  return emailQueue.add("send-reset-password", payload, { priority: 2 });
}
