import type { Request, Response } from "express";
import { User, UserRole } from "../models/User.js";
import { config } from "../config/index.js";
import { Affiliate } from "../models/Affiliate.js";
import { storageService } from "../services/storage.service.js";

interface AuthRequest extends Request {
  user?: { id: number; role: string };
}

interface AffilateResponse {
  bankType: string;
  nameOnAccount: string;
  accountNumber: string;
  bankBookImageUrl: string;
}

export const getAffiliates = async (_req: AuthRequest, res: Response) => {
  try {
    const affiliates = await Affiliate.findAll({
      include: [
        {
          model: User,
          attributes: ["id", "name", "email"],
        },
      ],
    });

    const formattedAffiliates: AffilateResponse[] = affiliates.map(
      (affiliate) => ({
        bankType: affiliate.bankType,
        nameOnAccount: affiliate.nameOnAccount,
        accountNumber: affiliate.accountNumber,
        bankBookImageUrl: affiliate.bankBookImageUrl,
      })
    );

    res.status(200).json({
      status: true,
      message: "Data affiliate berhasil diambil.",
      data: formattedAffiliates,
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: "Terjadi kesalahan pada server.",
      data: config.nodeEnv === "development" ? error : undefined,
    });
  }
};

export const requestAffiliate = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  const { bankType, nameOnAccount, accountNumber } = req.body;
  const files = req.files as { [fieldname: string]: Express.Multer.File[] };

  if (
    bankType === undefined ||
    nameOnAccount === undefined ||
    accountNumber === undefined
  ) {
    return res.status(400).json({
      success: false,
      message: "Semua field wajib diisi.",
      data: null,
    });
  }

  if (
    !files ||
    !files["bankBookImage"] ||
    files["bankBookImage"].length === 0
  ) {
    return res.status(400).json({
      success: false,
      message: "Gambar buku bank wajib diunggah.",
      data: null,
    });
  }

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

    const uploadResult = await storageService.uploadFile(
      files["bankBookImage"][0],
      "bank-books"
    );

    const newAffiliate = await Affiliate.create({
      userId: user.id,
      referralCode: `AFF-${Date.now()}`,
      bankType,
      nameOnAccount,
      accountNumber,
      bankBookImageUrl: uploadResult.url,
      bankBookImageKey: uploadResult.key,
    });

    await user.update({ role: UserRole.AFFILIATE });

    const formatedAffilaite: AffilateResponse = {
      bankType: newAffiliate.bankType,
      nameOnAccount: newAffiliate.nameOnAccount,
      accountNumber: newAffiliate.accountNumber,
      bankBookImageUrl: newAffiliate.bankBookImageUrl,
    };

    res.status(201).json({
      success: true,
      message: "Permohonan affiliate berhasil diajukan.",
      data: formatedAffilaite,
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: "Terjadi kesalahan pada server.",
      data: config.nodeEnv === "development" ? error : undefined,
    });
  }
};

export const updateForAffiliate = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  const { bankType, nameOnAccount, accountNumber } = req.body;
  const files = req.files as { [fieldname: string]: Express.Multer.File[] };

  console.log("Received file:", files);

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

    const affiliateUser = await Affiliate.findOne({
      where: { userId: user.id },
    });

    let imageUrl = "";
    let imageKey = "";

    if (
      files["bankBookImage"] !== undefined &&
      files["bankBookImage"].length > 0
    ) {
      await storageService.deleteFile(affiliateUser!.bankBookImageKey);
      const uploadResult = await storageService.uploadFile(
        files["bankBookImage"][0],
        "bank-books"
      );

      imageUrl = uploadResult.url;
      imageKey = uploadResult.key;
    }

    await affiliateUser?.update({
      bankType: bankType ? affiliateUser.bankType : bankType,
      nameOnAccount: nameOnAccount
        ? affiliateUser.nameOnAccount
        : nameOnAccount,
      accountNumber: accountNumber
        ? affiliateUser.accountNumber
        : accountNumber,
      bankBookImageUrl: imageUrl ? imageUrl : affiliateUser.bankBookImageUrl,
      bankBookImageKey: imageUrl ? imageKey : affiliateUser.bankBookImageKey,
    });

    const formatedAffilaite: AffilateResponse = {
      bankType: affiliateUser!.bankType,
      nameOnAccount: affiliateUser!.nameOnAccount,
      accountNumber: affiliateUser!.accountNumber,
      bankBookImageUrl: affiliateUser!.bankBookImageUrl,
    };

    res.status(200).json({
      success: true,
      message: "Data affiliate berhasil diperbarui.",
      data: formatedAffilaite,
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: "Terjadi kesalahan pada server.",
      data: config.nodeEnv === "development" ? error : undefined,
    });
  }
};
