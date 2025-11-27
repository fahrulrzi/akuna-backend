import { Worker, Job } from "bullmq";
import IORedis from "ioredis";
import { config } from "../config/index.js";
import { sendEmail } from "../utils/email.js";

const redisUrl =
  process.env.REDIS_URL || config.redis.url || "redis://localhost:6379";
const connection = new IORedis(redisUrl, {
  maxRetriesPerRequest: null,
  enableReadyCheck: true,
  retryStrategy(times) {
    return Math.min(2000 + times * 200, 20000);
  },
});

// debug start
console.log("=== WORKER START ===");
console.log("NODE_ENV:", process.env.NODE_ENV);
console.log("REDIS_URL:", !!process.env.REDIS_URL ? "[present]" : "[MISSING]");
console.log(
  "SENDGRID_API_KEY:",
  !!process.env.SENDGRID_API_KEY ? "[present]" : "[MISSING]"
);
console.log(
  "EMAIL_HOST:",
  !!process.env.EMAIL_HOST ? "[present]" : "[MISSING]"
);
console.log("====================");

const queueName = `${process.env.QUEUE_PREFIX || "akuna"}:email`;

const worker = new Worker(
  queueName,
  async (job: Job) => {
    if (job.name !== "send-reset-password") throw new Error("Unknown job");
    const { to, resetUrl, userId } = job.data as {
      to: string;
      resetUrl: string;
      userId: number | string;
    };

    const subject = "Link Reset Password Anda";
    const text = `Anda menerima email... Link: ${resetUrl}`;
    const html = `<p>Anda menerima email...</p><p><a href="${resetUrl}">${resetUrl}</a></p>`;

    await sendEmail({ to, subject, text, html });
    console.log(`Email sent to ${to} userId=${userId}`);
  },
  { connection, concurrency: Number(process.env.EMAIL_WORKER_CONCURRENCY || 5) }
);

worker.on("completed", (job) => console.log(`Job ${job.id} completed`));
worker.on("failed", (job, err) => console.error(`Job ${job?.id} failed`, err));
worker.on("error", (err) => console.error("Worker error", err));

process.on("SIGINT", async () => {
  await worker.close();
  await connection.quit();
  process.exit(0);
});
process.on("SIGTERM", async () => {
  await worker.close();
  await connection.quit();
  process.exit(0);
});

export default worker;
