import type { Request, Response } from "express";
import { User} from "../models/User.js";
import { Transaction } from "../models/Transaction.js";
import { TransactionItem } from "../models/TransactionItem.js";
import bcrypt from "bcrypt";

// Extend Request type untuk menyertakan user dari middleware
interface AuthRequest extends Request {
  user?: { id: number; role: string };
}

export const getProfile = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;

  try {
    const user = await User.findByPk(userId, {
      attributes: [
        "id",
        "name",
        "email",
        "role",
        "address",
        "city",
        "state",
        "postcode",
        "country",
        "phone",
        "addressFirstName",
        "addressLastName",
      ],
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User tidak ditemukan.",
        data: null,
      });
    }

    // Nested address object
    const formattedUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: (user as any).phone,
      address: {
        firstName: (user as any).addressFirstName,
        lastName: (user as any).addressLastName,
        contactPhone: (user as any).phone,
        email: user.email,
        address: (user as any).address,
        city: (user as any).city,
        state: (user as any).state,
        postcode: (user as any).postcode,
        country: (user as any).country,
      },
    };

    res.status(200).json({
      success: true,
      message: "Profil berhasil diambil.",
      data: formattedUser,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan pada server.",
      data: error,
    });
  }
};

export const updateProfile = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  const { name, email, phone, address } = req.body as {
    name?: string;
    email?: string;
    phone?: string;
    address?: {
      firstName?: string;
      lastName?: string;
      contactPhone?: string;
      email?: string;
      address?: string;
      city?: string;
      state?: string;
      postcode?: string;
      country?: string;
    };
  };

  try {
    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User tidak ditemukan.",
        data: null,
      });
    }

    // Update name
    if (name !== undefined) {
      user.name = name;
    }

    // Update email
    if (email !== undefined) {
      if (!email) {
        return res.status(400).json({
          success: false,
          message: "Email harus diisi.",
          data: null,
        });
      }

      // Check email taken or not
      const existing = await User.findOne({ where: { email } });
      if (existing && existing.id !== user.id) {
        return res.status(400).json({
          success: false,
          message: "Email sudah terdaftar.",
          data: null,
        });
      }

      user.email = email;
    }

    // Update phone
    if (phone !== undefined) {
      if (phone) {
        // Phone validation
        const phoneRegex = /^[0-9+\-\s()]+$/;
        if (!phoneRegex.test(phone)) {
          return res.status(400).json({
            success: false,
            message: "Format nomor telepon tidak valid.",
            data: null,
          });
        }
      }
      (user as any).phone = phone;
    }

    // Update address
    if (address !== undefined) {
      if (address.firstName !== undefined) {
        (user as any).addressFirstName = address.firstName;
      }
      if (address.lastName !== undefined) {
        (user as any).addressLastName = address.lastName;
      }
      if (address.contactPhone !== undefined) {
        if (address.contactPhone) {
          const phoneRegex = /^[0-9+\-\s()]+$/;
          if (!phoneRegex.test(address.contactPhone)) {
            return res.status(400).json({
              success: false,
              message: "Format nomor telepon tidak valid.",
              data: null,
            });
          }
        }
        (user as any).phone = address.contactPhone;
      }
      if (address.email !== undefined) {
        if (!address.email) {
          return res.status(400).json({
            success: false,
            message: "Email harus diisi.",
            data: null,
          });
        }

        const existing = await User.findOne({
          where: { email: address.email },
        });
        if (existing && existing.id !== user.id) {
          return res.status(400).json({
            success: false,
            message: "Email sudah terdaftar.",
            data: null,
          });
        }

        user.email = address.email;
      }
      if (address.address !== undefined) {
        (user as any).address = address.address;
      }
      if (address.city !== undefined) {
        (user as any).city = address.city;
      }
      if (address.state !== undefined) {
        (user as any).state = address.state;
      }
      if (address.postcode !== undefined) {
        (user as any).postcode = address.postcode;
      }
      if (address.country !== undefined) {
        (user as any).country = address.country;
      }
    }

    await user.save();

    // Nested address object
    const formattedUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: (user as any).phone,
      address: {
        firstName: (user as any).addressFirstName,
        lastName: (user as any).addressLastName,
        contactPhone: (user as any).phone,
        email: user.email,
        address: (user as any).address,
        city: (user as any).city,
        state: (user as any).state,
        postcode: (user as any).postcode,
        country: (user as any).country,
      },
    };

    res.status(200).json({
      success: true,
      message: "Profil berhasil diperbarui.",
      data: formattedUser,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan pada server.",
      data: error,
    });
  }
};

export const deleteProfile = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;

  try {
    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User tidak ditemukan.",
        data: null,
      });
    }

    await user.destroy();

    res.status(200).json({
      success: true,
      message: "Akun berhasil dihapus.",
      data: null,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan pada server.",
      data: error,
    });
  }
};

export const changePassword = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  const { currentPassword, newPassword } = req.body as {
    currentPassword?: string;
    newPassword?: string;
  };

  try {
    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User tidak ditemukan.",
        data: null,
      });
    }

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Password saat ini dan password baru wajib diisi.",
        data: null,
      });
    }

    const isMatch = await (user as any).comparePassword?.(currentPassword);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Password saat ini salah.",
        data: null,
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(newPassword, salt);
    (user as any).password = hashed;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password berhasil diubah.",
      data: null,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan pada server.",
      data: error,
    });
  }
};

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

