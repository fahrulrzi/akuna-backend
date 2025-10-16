import dotenv from "dotenv";
dotenv.config();

const jwtSecret = process.env.JWT_SECRET;
const jwtResetSecret = process.env.JWT_RESET_SECRET;

if (!jwtSecret) {
  console.error("FATAL ERROR: JWT_SECRET is not defined in .env file.");
  process.exit(1);
}

export const config = {
  port: process.env.PORT || 3000,
  clientUrl: process.env.CLIENT_URL || "http://localhost:3000",
  db: {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    name: process.env.DB_NAME,
    port: Number(process.env.DB_PORT),
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
  },
  biteship: {
    apiKey: process.env.BITESHIP_API_KEY,
    baseUrl: process.env.BITESHIP_BASE_URL || "https://api.biteship.com",
  },
};
