// src/utils/email.ts
import nodemailer from "nodemailer";
import sgMail from "@sendgrid/mail";
import { config } from "../config/index.js";

const useSendGrid = !!process.env.SENDGRID_API_KEY;
if (useSendGrid) sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

// nodemailer transporter (kept as fallback; keep debug off in prod)
const transporter = nodemailer.createTransport({
  host: config.email.host,
  port: Number(config.email.port),
  secure: Number(config.email.port) === 465,
  auth: {
    user: config.email.user,
    pass: config.email.pass,
  },
  pool: true,
  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 10000,
  tls: { rejectUnauthorized: config.nodeEnv === "production" },
});

// helper
async function sendViaNodemailer(options: any) {
  return transporter.sendMail({
    from: `"${config.email.fromName || "Akuna"}" <${config.email.user}>`,
    to: options.to,
    subject: options.subject,
    text: options.text,
    html: options.html,
  });
}

async function sendViaSendGrid(options: any) {
  const msg = {
    to: options.to,
    from: process.env.SENDGRID_FROM || config.email.user || "noreply@example.com",
    subject: options.subject,
    text: options.text,
    html: options.html,
  };
  return sgMail.send(msg);
}

export const sendEmail = async (options: { to: string; subject: string; text: string; html: string; }) => {
  // prefer SendGrid (HTTP) — safer in PaaS envs
  if (useSendGrid) {
    try {
      const res = await sendViaSendGrid(options);
      console.log("sendEmail: sent via SendGrid");
      return res;
    } catch (err) {
      console.error("sendEmail: SendGrid failed, error:", err);
      // fallthrough to nodemailer fallback
    }
  }

  // nodemailer fallback (may still timeout if network blocked)
  try {
    const info = await sendViaNodemailer(options);
    console.log("sendEmail: sent via nodemailer", info?.messageId);
    return info;
  } catch (err) {
    console.error("sendEmail: nodemailer failed:", err);
    throw err; // let worker retry / fail
  }
};
