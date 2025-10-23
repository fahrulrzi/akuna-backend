import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { config } from "../config/index.js";

interface AuthRequest extends Request {
  user?: { id: number; role: string };
}

interface JwtPayload {
  id: number;
  role: string;
}

export const isAuthenticated = (
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

  try {
    const secret = config.jwt.secret;
    if (!secret || typeof secret !== "string") {
      console.error("JWT secret tidak dikonfigurasi dengan benar");
      res.status(500).json({ message: "Kesalahan konfigurasi server." });
      return;
    }

    const decoded = jwt.verify(token, secret);

    if (
      decoded &&
      typeof decoded === "object" &&
      "id" in decoded &&
      "role" in decoded &&
      typeof decoded.id === "number" &&
      typeof decoded.role === "string"
    ) {
      req.user = {
        id: decoded.id,
        role: decoded.role,
      };
      next();
    } else {
      res.status(401).json({ message: "Format token tidak valid." });
    }
  } catch (error) {
    // Log error untuk debugging
    console.error("JWT verification error:", error);
    res.status(401).json({ message: "Token tidak valid." });
  }
};
