import dotenv from "dotenv";
import { send } from "process";
dotenv.config();

const jwtSecret = process.env.JWT_SECRET;
const jwtResetSecret = process.env.JWT_RESET_SECRET;

if (!jwtSecret) {
  console.error("FATAL ERROR: JWT_SECRET is not defined in .env file.");
  process.exit(1);
}

export const config = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: process.env.PORT || 3000,
  clientUrl: process.env.CLIENT_URL || "http://localhost:3000",
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:3000",
  db: {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    name: process.env.DB_NAME,
    port: Number(process.env.DB_PORT),
    ssl: (process.env.DB_SSL || "false") === "true",
    url: process.env.DATABASE_URL || null,
  },
  supabase: {
    url: process.env.SUPABASE_URL || null,
    apiKey: process.env.SUPABASE_API_KEY || null,
  }, 
  jwt: {
    secret: jwtSecret,
    resetSecret: jwtResetSecret,
  },
  email: {
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT),
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
    sendTimeoutMs: process.env.EMAIL_TIMEOUT,
    fromName: process.env.EMAIL_FROM_NAME || "Akuna",
  },
  biteship: {
    apiKey: process.env.BITESHIP_API_KEY,
    originAreaId: process.env.BITESHIP_ORIGIN_AREA_ID,
    baseUrl: process.env.BITESHIP_BASE_URL || "https://api.biteship.com",
  },
  objectStorage: {
    type: (process.env.STORAGE_TYPE as "local" | "r2") || "local",
    localPath: process.env.LOCAL_STORAGE_PATH || "uploads",
    baseUrl: process.env.BASE_URL || "http://localhost:3000",
    r2: {
      accountId: process.env.R2_ACCOUNT_ID || "",
      accessKeyId: process.env.R2_ACCESS_KEY_ID || "",
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || "",
      bucketName: process.env.R2_BUCKET_NAME || "",
      publicUrl: process.env.R2_PUBLIC_URL || "",
    },
  },
  redis: {
    url: process.env.REDIS_URL || "redis://localhost:6379",
  },
  queuePrefix: process.env.QUEUE_PREFIX || "akuna",
  // midtrans: {
  //   serverKey: process.env.MIDTRANS_SERVER_KEY || "",
  //   // clientKey: process.env.MIDTRANS_CLIENT_KEY || "",
  //   isProduction: process.env.NODE_ENV === "production",
  // },
};
