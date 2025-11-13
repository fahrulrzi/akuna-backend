import type { Request, Response } from "express";
import { Setting } from "../models/Setting.js";

interface AuthRequest extends Request {
  user?: { id: number; role: string };
}

export const getSettings = async (_req: AuthRequest, res: Response) => {
  try {
    const settings = await Setting.findAll();
    const settingsObj: { [key: string]: string } = {};
    settings.forEach((setting) => {
      settingsObj[setting.key] = setting.value;
    });
    res.status(200).json({
      success: true,
      message: "Settings retrieved successfully.",
      data: settingsObj,
    });
  } catch (error) {}
};

export const updateSetting = async (req: AuthRequest, res: Response) => {
  const { key, value } = req.body;

  if (!key || !value) {
    return res.status(400).json({
      success: false,
      message: "Key and value are required.",
      data: null,
    });
  }

  try {
    const setting = await Setting.findByPk(key);
    if (!setting) {
      return res.status(404).json({
        success: false,
        message: "Setting not found.",
        data: null,
      });
    }

    setting.value = value;
    await setting.save();

    res.status(200).json({
      success: true,
      message: "Setting updated successfully.",
      data: setting,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error.",
      data: null,
    });
  }
};
