import type { Request, Response } from "express";
import crypto from "crypto";
import { Product } from "../models/Product.js";
import { User } from "../models/User.js";
import { Transaction } from "../models/Transaction.js";
import { TransactionItem } from "../models/TransactionItem.js";
import { coreApi, snap } from "../config/midtrans.js";

// Generate unique order ID
const generateOrderId = (): string => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  return `ORDER-${timestamp}-${random}`;
};

// Create transaction and get Snap token
export const createTransaction = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id; // Dari auth middleware
    console.log("Authenticated user ID:", userId);
    const { products } = req.body; // Array of { productId, quantity }

    if (!products || !Array.isArray(products) || products.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Products array is required",
      });
    }

    // Validasi dan hitung total
    let totalAmount = 0;
    const transactionProducts = [];
    const itemDetails = [];

    for (const item of products) {
      const product = await Product.findByPk(item.productId);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product ${item.productId} not found`,
        });
      }

      // Check stock
      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for product ${product.name}`,
        });
      }

      const itemTotal = Number(product.price) * item.quantity;
      totalAmount += itemTotal;

      transactionProducts.push({
        productId: product.id,
        productName: product.name,
        quantity: item.quantity,
        price: Number(product.price),
      });

      itemDetails.push({
        id: product.id.toString(),
        price: Number(product.price),
        quantity: item.quantity,
        name: product.name,
      });
    }

    // Get user details
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Generate order ID
    const orderId = generateOrderId();

    // Create transaction in database
    const transaction = await Transaction.create({
      orderId,
      userId,
      products: transactionProducts,
      totalAmount,
      status: "pending",
    });

    // Create transaction items (opsional jika pakai table terpisah)
    for (const item of transactionProducts) {
      await TransactionItem.create({
        transactionId: transaction.id,
        productId: item.productId,
        productName: item.productName,
        quantity: item.quantity,
        price: item.price,
        subtotal: item.price * item.quantity,
      });
    }

    // Prepare Snap parameter
    const parameter = {
      transaction_details: {
        order_id: orderId,
        gross_amount: totalAmount,
      },
      customer_details: {
        first_name: (user as any).name || (user as any).email.split("@")[0],
        email: (user as any).email,
        phone: (user as any).phone || "",
      },
      item_details: itemDetails,
      callbacks: {
        finish: `${process.env.FRONTEND_URL}/payment/finish`,
        error: `${process.env.FRONTEND_URL}/payment/error`,
        pending: `${process.env.FRONTEND_URL}/payment/pending`,
      },
    };

    // Create Snap transaction
    const snapTransaction = await snap.createTransaction(parameter);

    // Update transaction with Snap data
    await transaction.update({
      snapToken: snapTransaction.token,
      snapRedirectUrl: snapTransaction.redirect_url,
    });

    return res.status(201).json({
      success: true,
      message: "Transaction created successfully",
      data: {
        orderId: transaction.orderId,
        token: snapTransaction.token,
        redirectUrl: snapTransaction.redirect_url,
      },
    });
  } catch (error: any) {
    console.error("Create transaction error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create transaction",
      error: error.message,
    });
  }
};

// Handle Midtrans notification/webhook
export const handleNotification = async (req: Request, res: Response) => {
  try {
    const notification = req.body;

    // Verify signature
    const orderId = notification.order_id;
    const statusCode = notification.status_code;
    const grossAmount = notification.gross_amount;
    const serverKey = process.env.MIDTRANS_SERVER_KEY;

    const signatureKey = crypto
      .createHash("sha512")
      .update(`${orderId}${statusCode}${grossAmount}${serverKey}`)
      .digest("hex");

    if (signatureKey !== notification.signature_key) {
      return res.status(401).json({
        success: false,
        message: "Invalid signature",
      });
    }

    // Get transaction status from Midtrans
    const statusResponse: any = await (coreApi as any).transaction.status(orderId);

    const transactionStatus = statusResponse.transaction_status;
    const fraudStatus = statusResponse.fraud_status;

    // Find transaction in database
    const transaction = await Transaction.findOne({ 
      where: { orderId } 
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found",
      });
    }

    // Update transaction status
    let newStatus: "pending" | "success" | "failed" | "expired" | "cancelled" = "pending";

    if (transactionStatus === "capture") {
      if (fraudStatus === "accept") {
        newStatus = "success";
      }
    } else if (transactionStatus === "settlement") {
      newStatus = "success";
    } else if (
      transactionStatus === "cancel" ||
      transactionStatus === "deny" ||
      transactionStatus === "expire"
    ) {
      newStatus = "failed";
    } else if (transactionStatus === "pending") {
      newStatus = "pending";
    }

    await transaction.update({
      status: newStatus,
      transactionId: statusResponse.transaction_id,
      paymentType: statusResponse.payment_type,
    });

    // Update stock if payment success
    if (newStatus === "success") {
      const products = transaction.products as Array<{
        productId: number;
        quantity: number;
      }>;

      for (const item of products) {
        const product = await Product.findByPk(item.productId);
        if (product) {
          await product.update({
            stock: product.stock - item.quantity,
          });
        }
      }
    }

    return res.status(200).json({
      success: true,
      message: "Notification handled successfully",
    });
  } catch (error: any) {
    console.error("Handle notification error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to handle notification",
      error: error.message,
    });
  }
};

// Get transaction status
export const getTransactionStatus = async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;
    const userId = (req as any).user.id;

    const transaction = await Transaction.findOne({
      where: { orderId, userId },
      include: [
        {
          model: User,
          attributes: ["id", "email", "name"],
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
        message: "Transaction not found",
      });
    }

    // Get latest status from Midtrans
    try {
      const statusResponse: any = await (coreApi as any).transaction.status(orderId);

      // Update local status if different
      const midtransStatus = statusResponse.transaction_status;
      if (midtransStatus === "settlement" && transaction.status !== "success") {
        await transaction.update({
          status: "success",
          transactionId: statusResponse.transaction_id,
          paymentType: statusResponse.payment_type,
        });
      }
    } catch (error) {
      console.log("Failed to get status from Midtrans:", error);
    }

    return res.status(200).json({
      success: true,
      data: transaction,
    });
  } catch (error: any) {
    console.error("Get transaction status error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to get transaction status",
      error: error.message,
    });
  }
};

// Get user transactions
export const getUserTransactions = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;

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

    return res.status(200).json({
      success: true,
      data: transactions,
    });
  } catch (error: any) {
    console.error("Get user transactions error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to get transactions",
      error: error.message,
    });
  }
};

// Cancel transaction
export const cancelTransaction = async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;
    const userId = (req as any).user.id;

    const transaction = await Transaction.findOne({
      where: { orderId, userId },
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found",
      });
    }

    if (transaction.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "Only pending transactions can be cancelled",
      });
    }

    // Cancel via Midtrans API
    try {
      await (coreApi as any).transaction.cancel(orderId);
    } catch (error) {
      console.log("Failed to cancel on Midtrans:", error);
    }

    await transaction.update({
      status: "cancelled",
    });

    return res.status(200).json({
      success: true,
      message: "Transaction cancelled successfully",
    });
  } catch (error: any) {
    console.error("Cancel transaction error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to cancel transaction",
      error: error.message,
    });
  }
};