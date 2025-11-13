import type { Request, Response } from "express";
import { User, UserRole } from "../models/User.js";
import { AffiliateRequest } from "../models/AffiliateRequest.js";
import { config } from "../config/index.js";
import { Affiliate } from "../models/Affiliate.js";

interface AuthRequest extends Request {
  user?: { id: number; role: string };
}

export const getAffiliates = async (_req: AuthRequest, res: Response) => {
  try {
    const affiliates = await AffiliateRequest.findAll({
      include: [{ model: User, as: "user" }],
    });

    res.status(200).json({
      status: true,
      message: "Data affiliate berhasil diambil.",
      data: affiliates,
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: "Terjadi kesalahan pada server.",
      data: config.nodeEnv === "development" ? error : undefined,
    });
  }
};

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

    if (user.address === null || user.phone === null) {
      return res.status(400).json({
        success: false,
        message:
          "Lengkapi data diri anda (alamat dan nomor telepon) sebelum mengajukan permohonan affiliate.",
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

    const existingRequest = await AffiliateRequest.findOne({
      where: {
        userId: user.id,
        status: "pending",
      },
    });

    if (existingRequest) {
      return res.status(400).json({
        success: false,
        message:
          "Anda sudah mengajukan permohonan affiliate. Silakan tunggu proses persetujuan.",
        data: null,
      });
    }

    // Buat permohonan affiliate baru
    const newRequest = await AffiliateRequest.create({
      userId: user.id,
      status: "pending",
    });

    res.status(200).json({
      success: true,
      message: "Akun anda sedang dalam proses pengajuan affiliate.",
      data: {
        user,
        affiliateRequest: newRequest,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: "Terjadi kesalahan pada server.",
      data: config.nodeEnv === "development" ? error : undefined,
    });
  }
};

export const approveAffiliate = async (req: AuthRequest, res: Response) => {
  //   const { userId } = req.params;
  const { userId, status } = req.body;

  try {
    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User tidak ditemukan.",
        data: null,
      });
    }

    // Ubah role user menjadi affiliate
    const existingRequest = await AffiliateRequest.findOne({
      where: {
        userId: user.id,
      },
    });

    if (!existingRequest) {
      return res.status(400).json({
        success: false,
        message: "Tidak ada permohonan affiliate yang tertunda untuk user ini.",
        data: null,
      });
    }

    if (status !== "approved" && status !== "rejected") {
      return res.status(400).json({
        success: false,
        message: "Status tidak valid. Harus 'approved' atau 'rejected'.",
        data: null,
      });
    }

    if (status === "approved") {
      user.role = UserRole.AFFILIATE;
      await user.save();

      const referalCode = `AFFILIATE-${user.id}-${Date.now()}`;

      const newAffiliate = await Affiliate.create({
        userId: user.id,
        referralCode: referalCode,
        // commissionRate: 0.1,
        totalCommission: 0,
      });

      existingRequest.status = status;
      await existingRequest.save();

      console.log("New Affiliate Created:", newAffiliate);
    }

    res.status(200).json({
      success: true,
      message: "Request affiliate telah diperbarui.",
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
