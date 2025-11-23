import { Request, Response } from "express";
import { User, UserRole } from "../models/User";

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
