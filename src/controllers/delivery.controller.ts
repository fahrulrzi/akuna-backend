import type { Request, Response } from "express";
import { biteshipClient } from "../utils/biteship.js";

export const getRates = async (req: Request, res: Response) => {
  try {
    const { items, ...biteshipPayload } = req.body as { items?: unknown; [key: string]: unknown };
    const payloadWithEmptyItems = {
      ...biteshipPayload,
      items: [],
    };
    const data = await biteshipClient.getRates(payloadWithEmptyItems);
    res.status(200).json({
      success: true,
      message: "Data rates berhasil diambil.",
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

export const addOrder = async (req: Request, res: Response) => {
  try {
    const data = await biteshipClient.createOrder(req.body);
    res.status(201).json({
      success: true,
      message: "Order berhasil ditambahkan.",
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

export const getTracking = async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  if (!id) {
    return res.status(400).json({ success: false, message: "Parameter id diperlukan.", data: null });
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


