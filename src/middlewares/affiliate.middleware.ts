import type { NextFunction, Request, Response } from "express";

interface AuthRequest extends Request {
  user?: { id: number; role: string };
}

export const isAffiliate = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ message: "Akses ditolak. Token tidak disediakan." });
    return;
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    res.status(401).json({ message: "Token tidak ditemukan." });
    return;
  }

  // Pastikan user sudah di-set oleh middleware isAuthenticated
  if (!req.user) {
    res
      .status(401)
      .json({ message: "Akses ditolak. User tidak terautentikasi." });
    return;
  }

  // Cek apakah role user adalah 'affiliate'
  if (req.user.role !== "affiliate") {
    res
      .status(403)
      .json({ message: "Akses ditolak. Hanya affiliate yang diizinkan." });
    return;
  }

  // Jika semua pengecekan lolos, lanjut ke middleware berikutnya
  next();
};
