import type { Request, Response } from "express";
import { biteshipClient } from "../utils/biteship.js";
import { config } from "../config/index.js";
import { Transaction } from "../models/Transaction.js";
import {
  BiteshipRatesResponse,
  ShippingDetails,
  ShippingItems,
} from "../types/delivery.type.js";
import { Product } from "../models/Product.js";
import { Setting } from "../models/Setting.js";

interface ShippingRatesResponse {
  courier_name: string;
  courier_code: string;
  duration?: string;
  shipment_duration_range?: string;
  shipment_duration_unit?: string;
  price: number;
  courier_company: string;
  type?: string;
}

export const searchAreas = async (req: Request, res: Response) => {
  const { query } = req.query as { query: string };

  if (!query || query.length < 3) {
    return res.status(400).json({
      success: false,
      message: "Query minimal 3 karakter.",
      data: null,
    });
  }

  try {
    const data = await biteshipClient.searchAreas(query);
    res.status(200).json({
      success: true,
      message: "Data area berhasil ditemukan.",
      data,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Gagal mencari area.",
      data: error,
    });
  }
};

export const getRates = async (req: Request, res: Response) => {
  try {
    const { postal_code, products, couriers } = req.body;
    if (
      !postal_code ||
      !products ||
      products.length === 0 ||
      !Array.isArray(products)
    ) {
      return res.status(400).json({
        success: false,
        message: "Data pengiriman tidak lengkap.",
      });
    }

    let totalAmount = 0;
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

      const itemTotal = Number(product.price) * item.quantity;
      totalAmount += itemTotal;

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

    const originPostalCode = await Setting.findOne({
      where: { key: "postal_code" },
    });

    const payload: ShippingDetails = {
      origin_postal_code: parseInt(originPostalCode?.value || "55281"),
      destination_postal_code: parseInt(postal_code),
      items: shippingItems ? [shippingItems] : [],
      couriers: couriers || "jne,sicepat,jnt",
    };

    console.log("Payload to Biteship:", payload); // Debugging
    const results: ShippingRatesResponse[] = [];

    const data: BiteshipRatesResponse = await biteshipClient.getRates(payload);

    for (const resData of data.pricing) {
      if (
        resData.shipping_type === "parcel" &&
        resData.available_collection_method.includes("pickup")
      ) {
        results.push({
          courier_name: resData.courier_name,
          courier_code: resData.courier_code,
          duration: resData.duration,
          shipment_duration_range: resData.shipment_duration_range,
          shipment_duration_unit: resData.shipment_duration_unit,
          price: resData.price,
          courier_company: resData.company,
          type: resData.type,
        });
      }
    }

    res.status(200).json({
      success: true,
      message: "Data rates berhasil diambil.",
      data: results,
    });
  } catch (error: any) {
    const errorData = error.data || error;
    console.error("Biteship Error:", errorData);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan pada server.",
      data: errorData,
    });
  }
};

// export const addOrder = async (req: Request, res: Response) => {
//   try {
//     const { recipient, shipping, items } = req.body;

//     if (!recipient || !shipping || !items) {
//       return res.status(400).json({ message: "Data order tidak lengkap." });
//     }

//     const biteshipPayload = {
//       // Data Akuna
//       shipper_contact_name: "Akuna",
//       shipper_contact_phone: "081222225862",
//       shipper_organization: "Akuna Indonesia",

//       origin_contact_name: "Admin",
//       origin_contact_phone: "081222225862",
//       origin_address:
//         "Kledokan CT XIX blok C no 14 Depok, Tempel, Caturtunggal, Kec. Depok, Kabupaten Sleman, Daerah Istimewa Yogyakarta",
//       origin_postal_code: parseInt(config.biteship.originPostalCode), // 55281

//       destination_contact_name: recipient.name,
//       destination_contact_phone: recipient.phone,
//       destination_contact_email: recipient.email || "",
//       destination_address: recipient.address,
//       destination_postal_code: parseInt(recipient.postal_code),
//       destination_note: recipient.note,

//       courier_company: shipping.courier_company,
//       courier_type: shipping.courier_type,
//       delivery_type: "now", // usually "now" or "later"

//       items: items,
//     };

//     console.log(
//       "Creating Order to Biteship:",
//       JSON.stringify(biteshipPayload, null, 2)
//     );

//     const data = await biteshipClient.createOrder(biteshipPayload);

//     res.status(201).json({
//       success: true,
//       message: "Order berhasil dibuat!",
//       data,
//     });
//   } catch (error: any) {
//     const errorData = error.data || error;
//     console.error("Biteship Order Error:", errorData);
//     res.status(500).json({
//       success: false,
//       message: "Terjadi kesalahan pada server.",
//       data: errorData,
//     });
//   }
// };

// export const addOrder = async (req: Request, res: Response) => {
//   try {
//     const { recipient, shipping, items } = req.body;

//     if (!recipient || !shipping || !items) {
//       return res.status(400).json({ message: "Data order tidak lengkap." });
//     }

//     const biteshipPayload = {
//       // Data Akuna
//       shipper_contact_name: "Akuna",
//       shipper_contact_phone: "081222225862",
//       shipper_organization: "Akuna Indonesia",

//       origin_contact_name: "Admin",
//       origin_contact_phone: "081222225862",
//       origin_address:
//         "Kledokan CT XIX blok C no 14 Depok, Tempel, Caturtunggal, Kec. Depok, Kabupaten Sleman, Daerah Istimewa Yogyakarta",
//       origin_postal_code: parseInt(config.biteship.originPostalCode), // 55281

//       destination_contact_name: recipient.name,
//       destination_contact_phone: recipient.phone,
//       destination_contact_email: recipient.email || "",
//       destination_address: recipient.address,
//       destination_postal_code: parseInt(recipient.postal_code),
//       destination_note: recipient.note,

//       courier_company: shipping.courier_company,
//       courier_type: shipping.courier_type,
//       delivery_type: "now", // usually "now" or "later"

//       items: items,
//     };

//     console.log(
//       "Creating Order to Biteship:",
//       JSON.stringify(biteshipPayload, null, 2)
//     );

//     const data = await biteshipClient.createOrder(biteshipPayload);

//     res.status(201).json({
//       success: true,
//       message: "Order berhasil dibuat!",
//       data,
//     });
//   } catch (error: any) {
//     const errorData = error.data || error;
//     console.error("Biteship Order Error:", errorData);
//     res.status(500).json({
//       success: false,
//       message: "Terjadi kesalahan pada server.",
//       data: errorData,
//     });
//   }
// };

export const handleBiteshipWebhook = async (req: Request, res: Response) => {
  try {
    const { order_id, status } = req.body; 
    console.log(`🔔 Webhook Biteship: ${order_id} is now ${status}`);

    const transaction = await Transaction.findOne({
      where: { trackingId: order_id }
    });

    if (!transaction) {
      return res.status(200).json({ success: true }); 
    }

    await transaction.update({
        deliveryStatus: status
    });

    if (status === 'delivered') {
        if (transaction.status !== 'success') {
            await transaction.update({ status: 'success' });
            console.log(`🎉 Order ${transaction.orderId} COMPLETED (Delivered).`);
        }
    } else if (status === 'picked_up' || status === 'on_delivery') {}

    return res.status(200).json({ success: true });

  } catch (error) {
    console.error("Webhook Error:", error);
    return res.status(500).json({ success: false });
  }
};

export const getTracking = async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  if (!id) {
    return res.status(400).json({
      success: false,
      message: "Parameter id diperlukan.",
      data: null,
    });
  }
  try {
    const data = await biteshipClient.getTracking(id);
    res.status(200).json({
      success: true,
      message: "Data tracking berhasil diambil.",
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
