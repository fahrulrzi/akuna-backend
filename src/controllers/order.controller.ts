import type { Request, Response } from "express";
import { User} from "../models/User.js";
import { Transaction } from "../models/Transaction.js";
import { TransactionItem } from "../models/TransactionItem.js";
import { Product } from "../models/Product.js";

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
          required: false,
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    const data = await Promise.all(
      transactions.map(async (tx) => {
        const t: any = tx;
        let firstProduct = null;

        if (t.items && (t.items || []).length > 0) {
          const item = t.items[0];
          const product = await Product.findByPk(item.productId, {
            attributes: ["id", "name", "images"],
          });
          firstProduct = {
            name: item.productName,
            quantity: item.quantity,
            price: Number(item.price),
            image: product?.images?.[0] ?? null,
          };
        } else if (t.products && (t.products || []).length > 0) {
          const prod = t.products[0];
          const product = await Product.findByPk(prod.productId, {
            attributes: ["id", "name", "images"],
          });
          firstProduct = {
            name: prod.productName,
            quantity: prod.quantity,
            price: prod.price,
            image: product?.images?.[0] ?? null,
          };
        }

        return {
          orderId: t.orderId,
          product: firstProduct,
          status: t.status,
          total: Number(t.totalAmount),
        };
      })
    );

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
          required: false,
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

    let productsList = [];
    if (t.items && (t.items || []).length > 0) {
      productsList = t.items.map((it: any) => ({
        productName: it.productName,
        quantity: it.quantity,
        price: Number(it.price),
        total: Number(it.subtotal),
      }));
    } else if (t.products && (t.products || []).length > 0) {
      productsList = t.products.map((p: any) => ({
        productName: p.productName,
        quantity: p.quantity,
        price: p.price,
        total: p.price * p.quantity,
      }));
    }

    const productsWithImages = await Promise.all(
      productsList.map(async (prod: any) => {
        let productId = null;
        if (t.items && (t.items || []).length > 0) {
          const item = t.items.find((it: any) => it.productName === prod.productName);
          productId = item?.productId;
        } else if (t.products && (t.products || []).length > 0) {
          const product = t.products.find((p: any) => p.productName === prod.productName);
          productId = product?.productId;
        }

        let image = null;
        if (productId) {
          const product = await Product.findByPk(productId, {
            attributes: ["images"],
          });
          image = product?.images?.[0] ?? null;
        }

        return {
          ...prod,
          image,
        };
      })
    );

    const totalAmount = productsWithImages.reduce((sum: number, p: any) => sum + Number(p.total), 0);

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
      products: productsWithImages,
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

