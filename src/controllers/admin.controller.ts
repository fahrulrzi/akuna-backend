import { Request, Response } from "express";
import { User, UserRole } from "../models/User";
import { Transaction } from "../models/Transaction";
import { TransactionItem } from "../models/TransactionItem";

interface AuthRequest extends Request {
  user?: { id: number; role: string };
}

export const getAllBuyer = async (_req: AuthRequest, res: Response) => {
  try {
    const users = await User.findAll({
      attributes: ["id", "name", "email", "role"],
      where: {
        role: UserRole.BUYER,
      },
    });

    res.status(200).json({
      success: true,
      message: "Daftar user berhasil diambil.",
      data: users,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan pada server.",
      data: error,
    });
  }
};

export const getAllAdmin = async (_req: AuthRequest, res: Response) => {
  try {
    const users = await User.findAll({
      attributes: ["id", "name", "email", "role"],
      where: {
        role: UserRole.ADMIN,
      },
    });

    res.status(200).json({
      success: true,
      message: "Daftar admin berhasil diambil.",
      data: users,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan pada server.",
      data: error,
    });
  }
};

export const addAdmin = async (req: AuthRequest, res: Response) => {
  const { name, email, password } = req.body;

  try {
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email sudah terdaftar.",
        data: null,
      });
    }

    const newAdmin = await User.create({
      name,
      email,
      password,
      role: UserRole.ADMIN,
    });

    res.status(201).json({
      success: true,
      message: "Admin baru berhasil ditambahkan.",
      data: {
        id: newAdmin.id,
        name: newAdmin.name,
        email: newAdmin.email,
        role: newAdmin.role,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan pada server.",
      data: error,
    });
  }
};

export const getAllOrder = async (_req: AuthRequest, res: Response) => {
  try {
    const transactions = await Transaction.findAll({
      include: [
        {
          model: User,
          attributes: ["id", "name", "email", "phone"],
        },
        {
          model: TransactionItem,
          as: "items",
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    const data = transactions.map((tx) => {
      const t: any = tx;
      const subtotal = (t.items || []).reduce(
        (s: number, it: any) => s + Number(it.subtotal || it.price * it.quantity || 0),
        0
      );

      return {
        id: t.orderId,
        orderId: t.orderId,
        date: t.createdAt,
        customerName: t.user?.name ?? null,
        amount: Number(t.totalAmount),
        status: t.status,
        products: t.products ?? [],
        items: t.items ?? [],
        subtotal,
      };
    });

    res.status(200).json({
      success: true,
      message: "Daftar order berhasil diambil.",
      data,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan pada server.",
      data: error,
    });
  }
};

export const getOrder = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const whereClause = { orderId: id };

    const transaction = await Transaction.findOne({
      where: whereClause,
      include: [
        {
          model: User,
          attributes: [
            "id",
            "name",
            "email",
            "phone",
            "address",
            "city",
            "state",
            "postcode",
            "country",
          ],
        },
        {
          model: TransactionItem,
          as: "items",
        },
      ],
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: "Order tidak ditemukan",
      });
    }

    const t: any = transaction;

    const products = t.items?.map((it: any) => ({
      productId: it.productId,
      productName: it.productName,
      quantity: it.quantity,
      price: Number(it.price),
      total: Number(it.subtotal),
    })) || (t.products || []);

    const subtotal = products.reduce((s: number, p: any) => s + Number(p.total || p.price * p.quantity || 0), 0);
    const discount = 0;
    const shippingRate = 0;

    const response = {
      id: t.orderId,
      orderId: t.orderId,
      createdAt: t.createdAt,
      customer: {
        fullName: t.user?.name ?? null,
        email: t.user?.email ?? null,
        phone: t.user?.phone ?? null,
      },
      orderInfo: {
        shipping: t.shippingProvider ?? null,
        paymentMethod: t.paymentType ?? null,
        status: t.status,
      },
      deliverTo: {
        address: t.user?.address ?? null,
        city: t.user?.city ?? null,
        state: t.user?.state ?? null,
        postcode: t.user?.postcode ?? null,
        country: t.user?.country ?? null,
      },
      paymentInfo: {
        method: t.paymentType ?? null,
        transactionId: t.transactionId ?? null,
      },
      products,
      subtotal,
      discount,
      shippingRate,
      total: Number(t.totalAmount),
    };

    return res.status(200).json({
      success: true,
      data: response,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan pada server.",
      data: error,
    });
  }
};

export const updateOrder = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowedStatuses = ["pending", "success", "failed", "expired", "cancelled"];
    if (!status || !allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Status tidak valid. Status: ${allowedStatuses.join(", ")}`,
      });
    }

    const whereClause = { orderId: id };

    const transaction = await Transaction.findOne({ where: whereClause });
    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: "Order tidak ditemukan",
      });
    }

    await transaction.update({ status });

    return res.status(200).json({
      success: true,
      message: "Status order berhasil diperbarui",
      data: { orderId: transaction.orderId, status },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan pada server.",
      data: error,
    });
  }
};
