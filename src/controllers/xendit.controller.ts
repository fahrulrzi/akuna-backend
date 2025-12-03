import type { Request, Response } from "express";
import { Product } from "../models/Product.js";
import { User } from "../models/User.js";
import { xenditBalance, xenditInvoice } from "../config/xendit.js";
import { Transaction } from "../models/Transaction.js";
import { biteshipClient } from "../utils/biteship.js";
import { config } from "../config/index.js";
import { Setting } from "../models/Setting.js";
import {
  BiteshipRatesResponse,
  shippingDetail,
  ShippingDetails,
  ShippingItems,
} from "../types/delivery.type.js";

// Generate unique external ID
const generateExternalId = (): string => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  return `INV-${timestamp}-${random}`;
};

interface AuthRequest extends Request {
  user?: { id: number; role: string };
}

// Create Invoice (Payment)
export const createXenditInvoice = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const {
      products,
      payment_methods,
      postal_code,
      courier_code,
      courier_company,
      type,
    } = req.body;

    if (
      !products ||
      !Array.isArray(products) ||
      products.length === 0 ||
      courier_code === undefined ||
      type === undefined
    ) {
      return res.status(400).json({
        success: false,
        message: "Product, courier, courierType, and type",
      });
    }

    // Calculate total
    let totalAmount = 0;
    const transactionProducts = [];
    const items = [];
    const shippingItems: ShippingItems = {
      name: "",
      quantity: 1,
      value: 0,
      length: 0,
      width: 0,
      height: 0,
      weight: 0,
    };

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

      //! logic ngakalin shipping items biar ongkir ga mahal

      shippingItems.name = shippingItems.name
        ? product.name
        : shippingItems.name + ", " + product.name;

      shippingItems.value = totalAmount;
      shippingItems.weight += Number(product.weight) * item.quantity;

      shippingItems.length =
        shippingItems.length < Number(product.length) * item.quantity
          ? Number(product.length) * item.quantity
          : shippingItems.length;

      shippingItems.height += Number(product.height) * item.quantity;
      shippingItems.width += Number(product.width);
    }

    // Get user
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.address === null || (user as any).phone === null) {
      return res.status(400).json({
        sucess: false,
        message:
          "Please complete your address and phone number on profile before creating an invoice.",
      });
    }

    const originPostalCode = await Setting.findOne({
      where: { key: "postal_code" },
    });

    const addressSetting = await Setting.findOne({
      where: { key: "address" },
    });

    const payloadShipping: ShippingDetails = {
      origin_postal_code: parseInt(originPostalCode?.value || "55281"),
      destination_postal_code: parseInt(postal_code || "55281"),
      items: shippingItems ? [shippingItems] : [],
      couriers: courier_code,
    };

    const shippingRes: BiteshipRatesResponse = await biteshipClient.getRates(
      payloadShipping
    );
    let shipping_cost = 0;
    let shippingDetails: shippingDetail = {
      origin_contact_name: "",
      origin_contact_phone: "",
      origin_contact_email: "",
      origin_address: "",
      origin_postal_code: 0,
      destination_contact_name: "",
      destination_contact_phone: "",
      destination_contact_email: "",
      destination_address: "",
      destination_postal_code: 0,
      courier_company: "",
      courier_type: "",
      delivery_type: "",
      items: [],
    }; //? bingung isi apa, kek perlu ga perlu, di fe jg ga ada detail lain sbgnya

    for (const resItem of shippingRes.pricing) {
      if (
        resItem.courier_code === courier_code &&
        resItem.shipping_type === "parcel" &&
        resItem.type === type &&
        resItem.company === courier_company &&
        resItem.available_collection_method.includes("pickup")
      ) {
        shipping_cost = resItem.price;
        shippingDetails = {
          origin_contact_name: "Akuna Store",
          origin_contact_phone: "081222225862",
          origin_contact_email: "akuna@gmail.com", //! jangan lupa diganti pake settings
          origin_address:
            addressSetting?.value ||
            "Kledokan CT XIX blok C no 14 Depok, Tempel, Caturtunggal, Kec. Depok, Kabupaten Sleman, Daerah Istimewa Yogyakarta 55281",
          origin_postal_code: parseInt(originPostalCode?.value || "55281"),
          destination_contact_name: user.name,
          destination_contact_phone: (user as any).phone || "081234567890",
          destination_contact_email: user.email,
          destination_address: (user as any).address || "Jl. User Address",
          destination_postal_code: parseInt(postal_code || "55281"),
          courier_company: courier_company || "",
          courier_type: type,
          delivery_type: "now",
          items: shippingItems ? [shippingItems] : [],
        };
        break;
      }
    }

    items.push({
      name: "Shipping Cost",
      quantity: 1,
      price: shipping_cost,
    });

    totalAmount += shipping_cost;

    // Generate external ID
    const externalId = generateExternalId();

    shippingDetails.reference_id = externalId;

    // Prepare invoice data
    const invoiceData: any = {
      externalId: externalId,
      amount: totalAmount,
      payerEmail: (user as any).email,
      description: `Payment for ${externalId}`,
      invoiceDuration: 86400, // 24 hours
      currency: "IDR",
      items: items,
      successRedirectUrl: `${process.env.FRONTEND_URL}/payment/success`,
      failureRedirectUrl: `${process.env.FRONTEND_URL}/payment/failed`,
    };

    // Set payment methods if specified
    if (payment_methods && Array.isArray(payment_methods)) {
      invoiceData.paymentMethods = payment_methods;
    }

    // Create invoice via Xendit
    const invoice = await xenditInvoice.createInvoice({ data: invoiceData });

    const transaction = await Transaction.create({
      orderId: externalId,
      userId,
      products: transactionProducts,
      totalAmount,
      status: "pending",
      shippingCost: Number(shipping_cost) || 0,
      shippingDetails: shippingDetails,
      transactionId: invoice.id,
      snapRedirectUrl: invoice.invoiceUrl,
    });

    // Update transaction with invoice data
    // await transaction.update({
    //   transactionId: invoice.id,
    //   snapRedirectUrl: invoice.invoiceUrl,
    // });

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
  // console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  // console.log("🔔 XENDIT WEBHOOK RECEIVED!");
  // console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  // console.log("📦 Body:", JSON.stringify(req.body, null, 2));
  // console.log("📋 Headers:", JSON.stringify(req.headers, null, 2));

  try {
    // Verify callback token
    const callbackToken = req.headers["x-callback-token"];
    const xenditCallbackToken = process.env.XENDIT_CALLBACK_TOKEN;

    if (callbackToken !== xenditCallbackToken) {
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

    // console.log(`✅ Transaction ${externalId} updated to ${newStatus}`);

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
            sold: product.sold + item.quantity,
          });
        }
      }
      try {
        console.log("📦 Payment succeed. Packing Order...");

        await transaction.update({
          status: "packing",
        });
        console.log(
          `✅ Order ${externalId} status updated to 'packing'. Waiting for Admin processing.`
        );
      } catch (error) {
        console.error("❌ Failed to update status to packing:", error);
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
export const getInvoiceStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { externalId } = req.params;
    const userId = req.user?.id;

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
