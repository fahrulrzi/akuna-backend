import nodemailer from "nodemailer";
import { config } from "../config/index.js";

const transporter = nodemailer.createTransport({
  host: config.email.host,
  port: Number(config.email.port),
  secure: config.email.port === 465,
  auth: {
    user: config.email.user,
    pass: config.email.pass,
  },
  pool: true,
  maxConnections: 5,
  maxMessages: 100,
  connectionTimeout: 5000,
  greetingTimeout: 5000,
  socketTimeout: 5000,
  tls: {
    rejectUnauthorized: true,
  },
  debug: true, // aktifkan saat debugging untuk lebih banyak log
  logger: true,
});

interface EmailOptions {
  to: string;
  subject: string;
  text: string;
  html: string;
}

transporter.verify((err, success) => {
  if (err) {
    console.error("SMTP verify failed:", err);
  } else {
    console.log("SMTP ready to send messages");
  }
});

function withTimeout<T>(p: Promise<T>, ms = 8000): Promise<T> {
  const timeout = new Promise<never>((_, rej) =>
    setTimeout(() => rej(new Error("Email operation timed out")), ms)
  );
  return Promise.race([p, timeout]);
}

export const sendEmail = async (options: EmailOptions) => {
  const mailOptions = {
    from: `"Akuna" <${config.email.user}>`,
    to: options.to,
    subject: options.subject,
    text: options.text,
    html: options.html,
  };

  return withTimeout(
    transporter.sendMail(mailOptions).then((info) => {
      console.log("Message sent:", info.messageId);
      return info;
    }),
    Number(config.email.sendTimeoutMs ?? 8000) // bisa set di config
  );
};
