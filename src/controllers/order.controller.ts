import type { Request, Response } from "express";
import { User} from "../models/User.js";
import { Transaction } from "../models/Transaction.js";
import { TransactionItem } from "../models/TransactionItem.js";

interface AuthRequest extends Request {
  user?: { id: number; role: string };
}

export const getUserOrders = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;

  try {
    const transactions = await Transaction.findAll({
      where: { userId },
      include: [
        {
          model: TransactionItem,
          as: "items",
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    const data = transactions.map((tx) => {
      const t: any = tx;
      const firstProduct = (t.items || []).length > 0 ? (t.items || [])[0] : null;

      return {
        orderId: t.orderId,
        product: firstProduct
          ? {
              name: firstProduct.productName,
              quantity: firstProduct.quantity,
              price: Number(firstProduct.price),
            }
          : null,
        status: t.status,
        total: Number(t.totalAmount),
      };
    });

    res.status(200).json({
      success: true,
      message: "Pesanan berhasil diambil.",
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

export const getUserOrderDetail = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  const { orderId } = req.params;

  try {
    const transaction = await Transaction.findOne({
      where: { orderId, userId },
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
            "addressFirstName",
            "addressLastName",
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
        message: "Pesanan tidak ditemukan.",
      });
    }

    const t: any = transaction;

    const products = (t.items || []).map((it: any) => ({
      productName: it.productName,
      quantity: it.quantity,
      price: Number(it.price),
      total: Number(it.subtotal),
    }));

    const totalAmount = products.reduce((sum: number, p: any) => sum + Number(p.total), 0);

    const response = {
      orderId: t.orderId,
      shippingAddress: {
        fullName: t.user?.name ?? null,
        phone: (t.user as any)?.phone ?? null,
        email: t.user?.email ?? null,
        address: (t.user as any)?.address ?? null,
        city: (t.user as any)?.city ?? null,
        state: (t.user as any)?.state ?? null,
        postcode: (t.user as any)?.postcode ?? null,
        country: (t.user as any)?.country ?? null,
      },
      products,
      total: totalAmount,
      status: t.status,
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

