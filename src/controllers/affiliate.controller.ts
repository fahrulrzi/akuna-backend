import type { Request, Response } from "express";
import { User, UserRole } from "../models/User.js";
import { config } from "../config/index.js";
import { Affiliate } from "../models/Affiliate.js";
import { storageService } from "../services/storage.service.js";
import { AffiliateCommission } from "../models/AffiliateCommission.js";
import { WithdrawRequest } from "../models/WithdrawRequest.js";
import sequelize  from "../config/database.js";

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

export const verifyAffiliateUser = async (req: Request, res: Response) => {
  const { id } = req.params; 
  const { action } = req.body;

  const t = await sequelize.transaction();

  try {
    const affiliate = await Affiliate.findByPk(id);
    if (!affiliate) {
      await t.rollback();
      return res.status(404).json({ message: "Affiliate not found" });
    }

    if (action === 'reject') {
      if (affiliate.bankBookImageKey) {
        await storageService.deleteFile(affiliate.bankBookImageKey);
      }

      await User.update(
        { role: UserRole.BUYER }, 
        { where: { id: affiliate.userId }, transaction: t }
      );

      await affiliate.destroy({ transaction: t });      
      await t.commit();
      return res.status(200).json({ success: true, message: "Affiliate ditolak dan role user dikembalikan." });
    } 
    
    else if (action === 'approve') {      
      await t.commit();
      return res.status(200).json({ success: true, message: "Affiliate verified/approved." });
    }

    await t.rollback();
    return res.status(400).json({ message: "Invalid action. Use 'approve' or 'reject'." });

  } catch (error) {
    await t.rollback();
    res.status(500).json({
      success: false, 
      message: "Server error", 
      error });
  }
};

export const getAllWithdrawRequests = async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const offset = (page - 1) * limit;
  const status = req.query.status as string; 

  try {
    const whereCondition = status ? { status } : {};

    const { count, rows } = await WithdrawRequest.findAndCountAll({
      where: whereCondition,
      limit,
      offset,
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: Affiliate,
          include: [
            {
              model: User,
              attributes: ['id', 'name', 'email'] 
            }
          ]
        }
      ]
    });

    res.status(200).json({
      success: true,
      data: {
        requests: rows,
        pagination: {
          totalItems: count,
          currentPage: page,
          totalPages: Math.ceil(count / limit)
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error", error });
  }
};

export const approveWithdraw = async (req: Request, res: Response) => {
  const { id } = req.params;
  const file = req.file;

  if (!file) {
    return res.status(400).json({ success: false, message: "Bukti transfer wajib diupload." });
  }

  const t = await sequelize.transaction();

  try {
    const withdrawRequest = await WithdrawRequest.findByPk(id);

    if (!withdrawRequest) {
      await t.rollback();
      return res.status(404).json({ success: false, message: "Request tidak ditemukan." });
    }

    if (withdrawRequest.status !== 'Pending') {
      await t.rollback();
      return res.status(400).json({ success: false, message: `Request sudah ${withdrawRequest.status}` });
    }

    const uploadResult = await storageService.uploadFile(file, "withdraw-proofs");

    await withdrawRequest.update({
      status: 'Approved',
      proofImageKey: uploadResult.key, 
    }, { transaction: t });
    
    await t.commit();
    res.status(200).json({ success: true, message: "Withdrawal disetujui.", data: withdrawRequest });

  } catch (error) {
    await t.rollback();
    res.status(500).json({ success: false, message: "Server Error", error });
  }
};

export const rejectWithdraw = async (req: Request, res: Response) => {
  const { id } = req.params;

  const t = await sequelize.transaction();

  try {
    const withdrawRequest = await WithdrawRequest.findByPk(id);
    if (!withdrawRequest) {
      await t.rollback();
      return res.status(404).json({ success: false, message: "Request tidak ditemukan." });
    }

    if (withdrawRequest.status !== 'Pending') {
      await t.rollback();
      return res.status(400).json({ success: false, message: `Request sudah ${withdrawRequest.status}` });
    }

    await withdrawRequest.update({ status: 'Rejected' }, { transaction: t });
    const affiliate = await Affiliate.findByPk(withdrawRequest.affiliateId);
    if (affiliate) {
        await affiliate.increment('totalCommission', { 
            by: withdrawRequest.amount, 
            transaction: t 
        });
    }

    await t.commit();

    res.status(200).json({ success: true, message: "Withdrawal ditolak & saldo dikembalikan." });

  } catch (error) {
    await t.rollback();
    res.status(500).json({ success: false, message: "Server Error", error });
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
      bankType: bankType || affiliateUser.bankType,
      nameOnAccount: nameOnAccount || affiliateUser.nameOnAccount,
      accountNumber: accountNumber || affiliateUser.accountNumber,
      bankBookImageUrl: imageUrl || affiliateUser.bankBookImageUrl,
      bankBookImageKey: imageKey || affiliateUser.bankBookImageKey,
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

export const getMyAffiliateData = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  try {
    const affiliate = await Affiliate.findOne({ where: { userId } });

    if (!affiliate) {
      return res.status(404).json({ 
        success: false, 
        message: "Data affiliate tidak ditemukan" });
    }

    res.status(200).json({
      success: true,
      data: {
        ...affiliate.dataValues,
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error });
  }
};

export const getCommissionHistory = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const offset = (page - 1) * limit;

  try {
    const affiliate = await Affiliate.findOne({ where: { userId } });
    if (!affiliate) return res.status(404).json({ message: "Affiliate not found" });

    const { count, rows: commissions } = await AffiliateCommission.findAndCountAll({
      where: { affiliateId: affiliate.id },
      order: [['createdAt', 'DESC']],
      limit: limit,
      offset: offset
    });

    const allCommissions = await AffiliateCommission.findAll({
        attributes: ['purchaseValue'],
        where: { affiliateId: affiliate.id }
    });
    const totalPurchaseValue = allCommissions.reduce((sum, item) => sum + item.purchaseValue, 0);
    
    res.status(200).json({
      success: true,
      data: {
        summary: {
            totalOrders: count,
            totalPurchaseValue,
            currentBalance: affiliate.totalCommission
        },
        history: commissions,
        pagination: {
            currentPage: page,
            totalPages: Math.ceil(count / limit),
            totalItems: count
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan pada server.",
      data: error,
    });
  }
};

export const requestWithdraw = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  const { amount } = req.body;

  const t = await sequelize.transaction();

  try {
    const affiliate = await Affiliate.findOne({ where: { userId } });
    if (!affiliate) {
        await t.rollback();
        return res.status(404).json({ message: "Affiliate not found" });
    }

    if (affiliate.totalCommission < Number(amount)) {
        await t.rollback();
        return res.status(400).json({ message: "Saldo tidak mencukupi" });
    }
    
    if (Number(amount) < 10000) {
        await t.rollback();
        return res.status(400).json({ message: "Minimal penarikan adalah Rp 10.000" });
    }

    const withdraw = await WithdrawRequest.create({
        affiliateId: affiliate.id,
        amount: Number(amount),
        status: 'Pending'
    }, { transaction: t });

    await affiliate.decrement('totalCommission', { by: Number(amount), transaction: t });
    await t.commit();
    await affiliate.reload(); 

    res.status(201).json({ 
        success: true, 
        message: "Permintaan withdraw berhasil dibuat.", 
        data: {
            withdraw,
            remainingBalance: affiliate.totalCommission
        }
    });

  } catch (error) {
    await t.rollback();
    
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan pada server.",
      data: error,
    });
  }
};