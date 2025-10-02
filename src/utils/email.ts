// src/utils/email.ts
import nodemailer from "nodemailer";
import { config } from "../config/index.js";

// Konfigurasi transporter Nodemailer
const transporter = nodemailer.createTransport({
  host: config.email.host,
  port: config.email.port,
  secure: false,
  auth: {
    user: config.email.user,
    pass: config.email.pass,
  },
});

interface EmailOptions {
  to: string;
  subject: string;
  text: string;
  html: string;
}

// Fungsi untuk mengirim email
export const sendEmail = async (options: EmailOptions) => {
  try {
    const info = await transporter.sendMail({
      from: `"Akuna" <${config.email.user}>`,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
    });
    console.log("Message sent: %s", info.messageId);
  } catch (error) {
    console.error("Error sending email:", error);
  }
};
