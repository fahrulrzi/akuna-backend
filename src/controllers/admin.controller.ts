import { Request, Response } from "express";
import { User, UserRole } from "../models/User";
import { Transaction } from "../models/Transaction";

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
          as: "user",
          attributes: ["id", "name"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    const data = transactions.map((tx) => {
      const t: any = tx;
      
      const productsList = t.products || [];
      const shipDetails = t.shippingDetails || {};

      let productSummary = "-";
      if (productsList.length > 0) {
        const first = productsList[0].productName;
        const rest = productsList.length - 1;
        productSummary = rest > 0 ? `${first}, +${rest} more` : first;
      }

      const customerName = t.user?.name || shipDetails.recipient?.name || "Customer";

      return {
        id: t.orderId,
        product: productSummary,
        orderId: t.orderId,
        date: t.createdAt,
        customerName: customerName,
        amount: Number(t.totalAmount), 
        status: t.status,              
      };
    });

    res.status(200).json({
      success: true,
      message: "Daftar order berhasil diambil.",
      data,
    });
  } catch (error) {
    console.error(error);
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

    const transaction = await Transaction.findOne({
      where: { orderId: id },
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "name", "email", "phone"],
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
    
    const productsData = t.products || [];
    const shipDetails = t.shippingDetails || {};
    const recipient = shipDetails.recipient || {};
    const shipping = shipDetails.shipping || {};

    const shippingCost = Number(t.shippingCost) || 0;
    const subtotal = productsData.reduce((acc: number, item: any) => acc + (Number(item.price) * Number(item.quantity)), 0);

    const response = {
      id: t.orderId,
      orderId: t.orderId,
      createdAt: t.createdAt,
      
      customer: {
        fullName: t.user?.name || recipient.name || "Customer",
        email: t.user?.email || recipient.email || "-",
        phone: t.user?.phone || recipient.phone || "-",
      },

      orderInfo: {
        shipping: shipping.courier_company 
          ? `${shipping.courier_company.toUpperCase()} - ${shipping.courier_type}` 
          : "N/A",
        paymentMethod: t.paymentType || "Manual",
        status: t.status,
        trackingId: t.trackingId,
        resi: t.courierResi,
      },

      deliverTo: {
        address: recipient.address,
        postcode: recipient.postal_code,
        note: recipient.note,
        receiverName: recipient.name,
      },

      paymentInfo: {
        method: t.paymentType,
        transactionId: t.transactionId,
      },

      products: productsData.map((p: any) => ({
        productName: p.productName,
        price: Number(p.price),
        quantity: Number(p.quantity),
        total: Number(p.price) * Number(p.quantity),
      })),

      subtotal: subtotal,
      discount: 0,
      shippingRate: shippingCost,
      total: Number(t.totalAmount),
    };

    return res.status(200).json({
      success: true,
      data: response,
    });
  } catch (error) {
    console.error(error);
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
