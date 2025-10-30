import type { Request, Response } from "express";

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

    // Ubah role user menjadi affiliate
    // NOTE: proses ini seharusnya melalui persetujuan admin,
    // bukan langsung diubah. Ini adalah versi sederhananya.
    // user.role = UserRole.AFFILIATE;
    // await user.save();

    res.status(200).json({
      success: true,
      message: "Akun anda sedang dalam proses pengajuan affiliate.",
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

export const approveAffiliate = async (req: AuthRequest, res: Response) => {
  const { userId } = req.params;

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
        status: "pending",
      },
    });

    if (!existingRequest) {
      return res.status(400).json({
        success: false,
        message: "Tidak ada permohonan affiliate yang tertunda untuk user ini.",
        data: null,
      });
    }

    user.role = UserRole.AFFILIATE;
    await user.save();

    existingRequest.status = "approved";
    await existingRequest.save();

    res.status(200).json({
      success: true,
      message: "User telah disetujui sebagai affiliate.",
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