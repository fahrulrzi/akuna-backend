import type { Request, Response } from "express";
import { Product } from "../models/Product.js";

export const addProduct = async (req: Request, res: Response) => {
  const { name, categoryId, description, price, image, stock } = req.body;

  try {
    // Masukkan product baru
    const newProduct = await Product.create({
      name,
      categoryId,
      description,
      price,
      image,
      stock,
    });

    res.status(201).json({
      success: true,
      message: "Produk berhasil ditambahkan.",
      data: newProduct,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan pada server.",
      data: error, //janlup ganti pas udah mau di deploy
    });
  }
};

export const getProducts = async (_req: Request, res: Response) => {
  try {
    const products = await Product.findAll();

    res.status(200).json({
      success: true,
      message: "Data produk berhasil diambil.",
      data: products,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan pada server.",
      data: error, //janlup ganti pas udah mau di deploy
    });
  }
};

export const getProductById = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const product = await Product.findByPk(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Produk tidak ditemukan.",
        data: null,
      });
    }

    res.status(200).json({
      success: true,
      message: "Data produk berhasil diambil.",
      data: product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan pada server.",
      data: error, //janlup ganti pas udah mau di deploy
    });
  }
};

export const getProductsByCategory = async (req: Request, res: Response) => {
  const { categoryId } = req.params;

  try {
    const products = await Product.findAll({ where: { categoryId } });

    res.status(200).json({
      success: true,
      message: "Data produk berhasil diambil.",
      data: products,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan pada server.",
      data: error, //janlup ganti pas udah mau di deploy
    });
  }
};

export const updateProduct = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, categoryId, description, price, image, stock } = req.body;

  try {
    const product = await Product.findByPk(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Produk tidak ditemukan.",
        data: null,
      });
    }

    // Update product
    product.name = name || product.name;
    product.categoryId = categoryId || product.categoryId;
    product.description = description || product.description;
    product.price = price || product.price;
    product.image = image || product.image;
    product.stock = stock || product.stock;

    await product.save();

    res.status(200).json({
      success: true,
      message: "Produk berhasil diperbarui.",
      data: product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan pada server.",
      data: error, //janlup ganti pas udah mau di deploy
    });
  }
};

export const deleteProduct = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const product = await Product.findByPk(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Produk tidak ditemukan.",
        data: null,
      });
    }

    await product.destroy();

    res.status(200).json({
      success: true,
      message: "Produk berhasil dihapus.",
      data: null,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan pada server.",
      data: error, //janlup ganti pas udah mau di deploy
    });
  }
};
