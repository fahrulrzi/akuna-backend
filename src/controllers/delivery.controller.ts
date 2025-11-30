import type { Request, Response } from "express";
import { biteshipClient } from "../utils/biteship.js";
import { config } from "../config/index.js"; 

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
    const { destination_area_id, items } = req.body;

    if (!destination_area_id || !items || items.length === 0) {
       return res.status(400).json({
          success: false, 
          message: "Area tujuan dan items (berat) diperlukan." 
       });
    }

    const payload = {
      origin_area_id: config.biteship.originAreaId,
      destination_area_id: destination_area_id,
      items: items,
      couriers: "jne,sicepat,gojek,grab,anteraja", //opsonal
    };

    const data = await biteshipClient.getRates(payload);

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