import type { Request, Response } from "express";
import { User } from "../models/User.js";
import jwt from "jsonwebtoken";
import { config } from "../config/index.js";
import bcrypt from "bcrypt";
import { sendEmail } from "../utils/email.js";

interface ResetTokenRequest {
  id: number;
}

export const register = async (req: Request, res: Response) => {
  const { name, email, password, address } = req.body;

  try {
    // Cek apakah email sudah terdaftar
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email sudah terdaftar.",
        data: null,
      });
    }

    // const salt = await bcrypt.genSalt(10);
    // const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      name: name,
      email: email,
      password: password,
      address: address,
    });

    res.status(201).json({
      success: true,
      message: "Registrasi berhasil!",
      data: {
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
          address: newUser.address,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan pada server.",
      data: config.nodeEnv === "development" ? error : undefined,
    });
  }
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    // Cari user berdasarkan email
    const user = await User.scope("withPassword").findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Email atau password salah.",
        data: null,
      });
    }

    // const isMatch = await bcrypt.compare(password, user.password);
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Email atau password salah.",
        data: null,
      });
    }

    // Buat JWT Token
    const token = jwt.sign(
      { id: user.id, role: user.role },
      config.jwt.secret,
      { expiresIn: "1d" }
    );

    res.status(200).json({
      success: true,
      message: "Login berhasil!",
      token,
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan pada server.",
      data: config.nodeEnv === "development" ? error : undefined,
    });
  }
};

export const forgotPassword = async (req: Request, res: Response) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ where: { email } });

    // tidak memberi tahu user apakah email ada atau tidak
    if (!user) {
      return res.status(200).json({
        success: true,
        message: "Jika email terdaftar, link reset password akan dikirimkan.",
        data: null,
      });
    }

    // Buat token reset yang berlaku singkat
    if (!config.jwt.resetSecret) {
      throw new Error("Reset secret is not defined in config.");
    }
    const resetToken = jwt.sign({ id: user.id }, config.jwt.resetSecret, {
      expiresIn: "15m",
    });

    // Buat URL reset
    const resetUrl = `${config.clientUrl}/reset-password/${resetToken}`;

    // Kirim email
    await sendEmail({
      to: user.email,
      subject: "Link Reset Password Anda",
      text: `Anda menerima email ini karena Anda (atau orang lain) meminta untuk mereset password akun Anda. Silakan klik link berikut atau salin ke browser Anda untuk menyelesaikan proses: \n\n ${resetUrl} \n\n Jika Anda tidak meminta ini, abaikan email ini dan password Anda akan tetap aman.`,
      html: `<p>Anda menerima email ini karena Anda (atau orang lain) meminta untuk mereset password akun Anda. Silakan klik link berikut atau salin ke browser Anda untuk menyelesaikan proses:</p><p><a href="${resetUrl}">${resetUrl}</a></p><p>Jika Anda tidak meminta ini, abaikan email ini dan password Anda akan tetap aman.</p>`,
    });

    res.status(200).json({
      success: true,
      message: "Jika email terdaftar, link reset password akan dikirimkan.",
      data: null,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan pada server.",
      data: config.nodeEnv === "development" ? error : undefined,
    });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  const { token } = req.params;
  const { password } = req.body;

  if (!token) {
    return res.status(400).json({
      success: false,
      message: "Token reset tidak disediakan.",
      data: null,
    });
  }

  try {
    // Verifikasi token menggunakan secret yang benar
    const decoded = jwt.verify(
      token,
      config.jwt.resetSecret as string
    ) as unknown as ResetTokenRequest;

    if (!decoded) {
      return res.status(401).json({
        success: false,
        message: "Token tidak valid atau kedaluwarsa.",
        data: null,
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Cari user dan update passwordnya
    const user = await User.findByPk(decoded.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User tidak ditemukan.",
        data: null,
      });
    }

    user.password = hashedPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password berhasil diubah.",
      data: null,
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      message: "Token tidak valid atau kedaluwarsa.",
      data: config.nodeEnv === "development" ? error : undefined,
    });
  }
};
