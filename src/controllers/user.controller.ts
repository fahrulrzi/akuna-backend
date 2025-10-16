import type { Request, Response } from "express";
import { User, UserRole } from "../models/User.js";
import { config } from "../config/index.js";

// Extend Request type untuk menyertakan user dari middleware
interface AuthRequest extends Request {
  user?: { id: number; role: string };
}

export const applyForAffiliate = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;

  try {
    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User tidak ditemukan.",
        data: null,
      });
    }

    // Cek jika user sudah menjadi affiliate
    if (user.role === UserRole.AFFILIATE) {
      return res.status(400).json({
        success: false,
        message: "Anda sudah menjadi affiliate.",
        data: null,
      });
    }

    // Ubah role user menjadi affiliate
    // NOTE: proses ini seharusnya melalui persetujuan admin,
    // bukan langsung diubah. Ini adalah versi sederhananya.
    user.role = UserRole.AFFILIATE;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Selamat! Anda berhasil mendaftar sebagai affiliate.",
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: "Terjadi kesalahan pada server.",
      data: config.nodeEnv === "development" ? error : undefined,
    });
  }
};
