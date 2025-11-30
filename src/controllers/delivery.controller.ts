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

    const { destination_postal_code, items, couriers } = req.body;
    if (!destination_postal_code || !items || items.length === 0) {
       return res.status(400).json({
          success: false, 
          message: "Postal code tujuan dan berat item diperlukan." 
       });
    }

    const payload = {
      origin_postal_code: parseInt(config.biteship.originPostalCode),       
      destination_postal_code: parseInt(destination_postal_code), 
      items: items,
      couriers: couriers || "jne,sicepat,gojek,grab,anteraja,paxel", 
    };

    console.log("Payload to Biteship:", payload); // Debugging

    const data = await biteshipClient.getRates(payload);

    res.status(200).json({
      success: true,
      message: "Data rates berhasil diambil.",
      data,
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

export const addOrder = async (req: Request, res: Response) => {
  try {
    const { recipient, shipping, items } = req.body;

    if (!recipient || !shipping || !items) {
      return res.status(400).json({ message: "Data order tidak lengkap." });
    }

    const biteshipPayload = {
      // Data Akuna
      shipper_contact_name: "Akuna",
      shipper_contact_phone: "081222225862",
      shipper_organization: "Akuna Indonesia",
      
      origin_contact_name: "Admin",
      origin_contact_phone: "081222225862",
      origin_address: "Kledokan CT XIX blok C no 14 Depok, Tempel, Caturtunggal, Kec. Depok, Kabupaten Sleman, Daerah Istimewa Yogyakarta",
      origin_postal_code: parseInt(config.biteship.originPostalCode), // 55281

      destination_contact_name: recipient.name,
      destination_contact_phone: recipient.phone,
      destination_contact_email: recipient.email || "",
      destination_address: recipient.address,
      destination_postal_code: parseInt(recipient.postal_code),
      destination_note: recipient.note,

      courier_company: shipping.courier_company,
      courier_type: shipping.courier_type,
      delivery_type: "now", // usually "now" or "later"

      items: items
    };

    console.log("Creating Order to Biteship:", JSON.stringify(biteshipPayload, null, 2));

    const data = await biteshipClient.createOrder(biteshipPayload);

    res.status(201).json({
      success: true,
      message: "Order berhasil dibuat!",
      data,
    });

  } catch (error: any) {
    const errorData = error.data || error;
    console.error("Biteship Order Error:", errorData);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan pada server.",
      data: errorData
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