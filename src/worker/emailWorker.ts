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

const queueName = "email";

const worker = new Worker(
  queueName,
  async (job: Job) => {
    console.log(
      `WORKER: got job ${job.id} name=${job.name} data=${JSON.stringify(
        job.data
      )}`
    );

    if (job.name !== "send-reset-password") {
      throw new Error("Unknown job");
    }

    const { to, resetUrl, userId } = job.data as {
      to: string;
      resetUrl: string;
      userId: number | string;
    };

    const subject = "Link Reset Password Anda";
    const text = `Anda menerima email... Link: ${resetUrl}`;
    const html = `<p>Anda menerima email...</p><p><a href="${resetUrl}">${resetUrl}</a></p>`;

    // *critical log* right before calling sendEmail
    await sendEmail({ to, subject, text, html });
  },
  {
    connection,
    prefix: config.queuePrefix || process.env.QUEUE_PREFIX || "akuna",
    concurrency: Number(process.env.EMAIL_WORKER_CONCURRENCY || 5),
  }
);

// after creating worker:
worker.on("active", (job) =>
  console.log(`> active job ${job.id} ${job.name}`, job.data)
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
