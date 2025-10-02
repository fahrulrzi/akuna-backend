import type { Request, Response } from "express";
import { User } from "../models/User.js";
import jwt from "jsonwebtoken";
import { config } from "../config/index.js";

export const register = async (req: Request, res: Response) => {
  const { name, email, password, alamat } = req.body;

  try {
    // Cek apakah email sudah terdaftar
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: "Email sudah terdaftar." });
    }

    // Buat user baru (password akan di-hash oleh hook di model)
    const newUser = await User.create({ name, email, password });

    res.status(201).json({
      message: "Registrasi berhasil!",
      user: { id: newUser.id, name: newUser.name, email: newUser.email },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan pada server.",
      data: error, //janlup ganti pas udah mau di deploy
    });
  }
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    // Cari user berdasarkan email
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: "Email atau password salah." });
    }

    // Bandingkan password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Email atau password salah." });
    }

    // Buat JWT Token
    const token = jwt.sign(
      { id: user.id, role: user.role },
      config.jwt.secret,
      { expiresIn: "1d" } // Token berlaku 1 hari
    );

    res.status(200).json({
      message: "Login berhasil!",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan pada server.",
      data: error, //janlup ganti pas udah mau di deploy
    });
  }
};

export const sendForgetPasswordEmail = async (req: Request, res: Response) => {
  const { email } = req.body;

  try {
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan pada server.",
      data: error, //janlup ganti pas udah mau di deploy
    });
  }
};

export const forgetPassword = async (req: Request, res: Response) => {
  const { email, newPassword } = req.body;
};
