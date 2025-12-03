import type { Request, Response } from "express";
// import { User} from "../models/User.js";
import { Transaction } from "../models/Transaction.js";
import { TransactionItem } from "../models/TransactionItem.js";
import { Product } from "../models/Product.js";
import { biteshipClient } from "../utils/biteship.js";

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
    });

    if (!transaction) {
      return res.status(404).json({ success: false, message: "Pesanan tidak ditemukan." });
    }

    const t: any = transaction;

    const productsData = t.products || [];
    const productsWithImages = await Promise.all(
      productsData.map(async (prod: any) => {
        const productDb = await Product.findByPk(prod.productId, {
            attributes: ["images"],
        });
        return {
          productName: prod.productName,
          quantity: prod.quantity,
          price: Number(prod.price),
          total: Number(prod.price) * Number(prod.quantity),
          image: productDb?.images?.[0] ?? null,
        };
      })
    );

    const shipDetails = t.shippingDetails || {};
    const recipient = shipDetails.recipient || {};
    const shipping = shipDetails.shipping || {};

    let timeline = [];

    timeline.push({
        date: t.createdAt,
        title: "Idle",
        description: "Pesanan berhasil dibuat. Menunggu pembayaran.",
        active: true
    });

    if (t.status === 'success') {
        timeline.push({
            date: t.updatedAt, 
            title: "Order Placed",
            description: "Pembayaran telah diterima.",
            active: true
        });
    }

    const packingPhases = ['packing', 'packed', 'ready_to_ship', 'shipped', 'on_delivery', 'delivered', 'picked_up'];
    if (packingPhases.includes(t.deliveryStatus)) {
        timeline.push({
            date: t.updatedAt, 
            title: "Packing Order",
            description: "Pesanan sedang dikemas.",
            active: true
        });
    }

    const packedPhases = ['packed', 'ready_to_ship', 'shipped', 'on_delivery', 'delivered', 'picked_up'];
    if (packedPhases.includes(t.deliveryStatus)) {
         timeline.push({
            date: t.updatedAt, 
            title: "Order Packed",
            description: "Pesanan selesai dikemas.",
            active: true
        });
    }

    if (t.trackingId) {
        try {
            const trackingRes = await biteshipClient.getTracking(t.trackingId);
            const biteshipHistory = trackingRes.history.map((hist: any) => ({
                date: hist.updated_at,
                title: mapBiteshipStatus(hist.status), 
                description: hist.note,
                active: true
            }));
            
            timeline = [...biteshipHistory.reverse(), ...timeline]; 

        } catch (error) {
            console.error("Gagal ambil tracking biteship:", error);
             if (t.deliveryStatus !== 'packing' && t.deliveryStatus !== 'packed') {
                 timeline.unshift({
                    date: new Date(),
                    title: "Shipping Info",
                    description: `Resi: ${t.courierResi}. Cek manual untuk update.`,
                    active: true
                });
             }
        }
    }

    const response = {
      orderId: t.orderId,
      status: t.status,
      deliveryStatus: t.deliveryStatus,
      
      shippingAddress: {
	      fullName: recipient.name,
        phone: recipient.phone,
        email: recipient.email,
        address: recipient.address,
        postcode: recipient.postal_code,
      },
      
      products: productsWithImages,
      
      total: Number(t.totalAmount), 
      shippingCost: Number(t.shippingCost),
      
      snapRedirectUrl: t.snapRedirectUrl,
      timeline: timeline
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

function mapBiteshipStatus(status: string) {
    switch (status) {
        case 'confirmed': return 'Order Confirmed';
        case 'allocated': return 'Courier Allocated';
        case 'picking_up': return 'Picking Up';
        case 'picked_up': return 'Picked Up';
        case 'dropping_off': return 'Dropping Off';
        case 'return_in_transit': return 'Return in Transit';
        case 'on_delivery': return 'Out for Delivery';
        case 'delivered': return 'Delivered';
        default: return status.toUpperCase();
    }
}