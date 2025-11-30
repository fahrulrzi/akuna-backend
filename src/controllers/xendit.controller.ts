import crypto from "crypto";
import type { Request, Response } from "express";
import { Product } from "../models/Product.js";
import { User } from "../models/User.js";
import { xenditBalance, xenditInvoice } from "../config/xendit.js";
import { Transaction } from "../models/Transaction.js";
import { biteshipClient } from "../utils/biteship.js";
import { config } from "../config/index.js";

// Generate unique external ID
const generateExternalId = (): string => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  return `INV-${timestamp}-${random}`;
};

// Create Invoice (Payment)
export const createXenditInvoice = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { products, paymentMethods, description, shipping_cost, shipping_details } = req.body;

    if (!products || !Array.isArray(products) || products.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Products array is required",
      });
    }

    // Calculate total
    let totalAmount = 0;
    const transactionProducts = [];
    const items = [];

    for (const item of products) {
      const product = await Product.findByPk(item.productId);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product ${item.productId} not found`,
        });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for product ${product.name}`,
        });
      }

      const itemTotal = Number(product.price) * item.quantity;
      totalAmount += itemTotal;
      
      if (shipping_cost) {
        totalAmount += Number(shipping_cost);
    }

      transactionProducts.push({
        productId: product.id,
        productName: product.name,
        quantity: item.quantity,
        price: Number(product.price),
        weight: Number(product.weight),
      });

      items.push({
        name: product.name,
        quantity: item.quantity,
        price: Number(product.price),
      });
    }

    // Get user
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Generate external ID
    const externalId = generateExternalId();

    // Create transaction in database
    const transaction = await Transaction.create({
      orderId: externalId,
      userId,
      products: transactionProducts,
      totalAmount,
      status: "pending",
      shippingCost: Number(shipping_cost) || 0, 
      shippingDetails: shipping_details,
    });

    // Prepare invoice data
    const invoiceData: any = {
      externalId: externalId,
      amount: totalAmount,
      payerEmail: (user as any).email,
      description: description || `Payment for ${externalId}`,
      invoiceDuration: 86400, // 24 hours
      currency: "IDR",
      items: items,
      successRedirectUrl: `${process.env.FRONTEND_URL}/payment/success`,
      failureRedirectUrl: `${process.env.FRONTEND_URL}/payment/failed`,
    };

    // Set payment methods if specified
    if (paymentMethods && Array.isArray(paymentMethods)) {
      invoiceData.paymentMethods = paymentMethods;
    }

    // Create invoice via Xendit
    const invoice = await xenditInvoice.createInvoice({ data: invoiceData });

    // Update transaction with invoice data
    await transaction.update({
      transactionId: invoice.id,
      snapToken: invoice.invoiceUrl,
      snapRedirectUrl: invoice.invoiceUrl,
    });

    return res.status(201).json({
      success: true,
      message: "Invoice created successfully",
      data: {
        orderId: transaction.orderId,
        invoiceId: invoice.id,
        invoiceUrl: invoice.invoiceUrl,
        expiryDate: invoice.expiryDate,
        amount: invoice.amount,
      },
    });
  } catch (error: any) {
    console.error("Create Xendit invoice error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create invoice",
      error: error.message,
    });
  }
};

// Handle Xendit webhook/callback
export const handleXenditCallback = async (req: Request, res: Response) => {
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("🔔 XENDIT WEBHOOK RECEIVED!");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("📦 Body:", JSON.stringify(req.body, null, 2));
  console.log("📋 Headers:", JSON.stringify(req.headers, null, 2));

  try {
    // Verify callback token
    const callbackToken = req.headers["x-callback-token"];
    const xenditCallbackToken = process.env.XENDIT_CALLBACK_TOKEN;

    if (callbackToken !== xenditCallbackToken) {
      console.log("❌ Invalid callback token");
      return res.status(401).json({
        success: false,
        message: "Invalid callback token",
      });
    }

    const data = req.body;
    const externalId = data.external_id;
    const status = data.status;

    // Find transaction
    const transaction = await Transaction.findOne({
      where: { orderId: externalId },
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found",
      });
    }

    // Map Xendit status to our status
    let newStatus: "pending" | "success" | "failed" | "expired" | "cancelled" =
      "pending";

    switch (status) {
      case "PAID":
      case "SETTLED":
        newStatus = "success";
        break;
      case "EXPIRED":
        newStatus = "expired";
        break;
      case "PENDING":
        newStatus = "pending";
        break;
      default:
        newStatus = "failed";
    }

    // Update transaction
    await transaction.update({
      status: newStatus,
      paymentType: data.payment_method || data.payment_channel,
    });

    console.log(`✅ Transaction ${externalId} updated to ${newStatus}`);

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
          console.log(`✅ Stock updated for product ${item.productId}`);
        }
      }
      try {
          console.log("🚚 Preparing shipment with Biteship...");
          const shipDetails = (transaction as any).shippingDetails; 
          
          const biteshipItems = (transaction.products as any[]).map((p: any) => ({
              name: p.productName,
              value: p.price,
              quantity: p.quantity,
              weight: p.weight
          }));

          if (shipDetails) {
             const biteshipPayload = {
                shipper_contact_name: "Akuna Store",
                shipper_contact_phone: "081222225862",
                origin_postal_code: parseInt(config.biteship.originPostalCode),

                destination_contact_name: shipDetails.recipient.name,
                destination_contact_phone: shipDetails.recipient.phone,
                destination_address: shipDetails.recipient.address,
                destination_postal_code: parseInt(shipDetails.recipient.postal_code),
                destination_note: shipDetails.recipient.note,

                courier_company: shipDetails.shipping.courier_company,
                courier_type: shipDetails.shipping.courier_type,
                delivery_type: "now",
                items: biteshipItems
             };

             const shipRes = await biteshipClient.createOrder(biteshipPayload);
             console.log(`✅ Biteship Order Created: ${shipRes.id}`);

             await transaction.update({
                 trackingId: shipRes.id,
                 courierResi: shipRes.courier.waybill_id
             });
          }
      } catch (shipError) {
          console.error("❌ Biteship callback error:", shipError);
      }
    }

    return res.status(200).json({
      success: true,
      message: "Callback handled successfully",
    });
  } catch (error: any) {
    console.error("❌ Xendit callback error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to handle callback",
      error: error.message,
    });
  }
};

// Get Xendit balance
export const getXenditBalance = async (req: Request, res: Response) => {
  try {
    const balance = await xenditBalance.getBalance({});

    return res.status(200).json({
      success: true,
      data: {
        balance: balance.balance,
        currency: "IDR",
        formattedBalance: new Intl.NumberFormat("id-ID", {
          style: "currency",
          currency: "IDR",
        }).format(balance.balance),
      },
    });
  } catch (error: any) {
    console.error("Get Xendit balance error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to get balance",
      error: error.message,
    });
  }
};

// Get invoice by external ID
export const getInvoiceStatus = async (req: Request, res: Response) => {
  try {
    const { externalId } = req.params;
    const userId = (req as any).user.id;

    const transaction = await Transaction.findOne({
      where: { orderId: externalId, userId },
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found",
      });
    }

    // Get latest status from Xendit
    try {
      const invoice = await xenditInvoice.getInvoiceById({
        invoiceId: transaction.transactionId!,
      });

      // Update if different
      let newStatus:
        | "pending"
        | "success"
        | "failed"
        | "expired"
        | "cancelled" = "pending";

      switch (invoice.status) {
        case "PAID":
        case "SETTLED":
          newStatus = "success";
          break;
        case "EXPIRED":
          newStatus = "expired";
          break;
        case "PENDING":
          newStatus = "pending";
          break;
        default:
          newStatus = "failed";
      }

      if (transaction.status !== newStatus) {
        await transaction.update({ status: newStatus });
      }
    } catch (error) {
      console.log("Failed to get invoice from Xendit:", error);
    }

    return res.status(200).json({
      success: true,
      data: transaction,
    });
  } catch (error: any) {
    console.error("Get invoice status error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to get invoice status",
      error: error.message,
    });
  }
};
