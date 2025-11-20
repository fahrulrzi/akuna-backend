import type { Request, Response } from "express";
import { config } from "../config/index.js";
import slugify from "slugify";
import { Category } from "../models/Category.js";

export const addCategory = async (req: Request, res: Response) => {
  const { name, slug, description } = req.body;

  try {
    // Cek apakah nama kategori sudah ada
    const existingCategory = await Category.findOne({ where: { name } });
    if (existingCategory) {
      return res.status(400).json({
        success: false,
        message: "Kategori dengan nama tersebut sudah ada.",
        data: null,
      });
    }

    const generatedSlug = slug
      ? slugify(slug, { lower: true, strict: true })
      : slugify(name, { lower: true, strict: true });

    const existingSlug = await Category.findOne({
      where: { slug: generatedSlug },
    });
    if (existingSlug) {
      return res.status(400).json({
        success: false,
        message: "Slug kategori sudah ada. Gunakan nama yang berbeda.",
        data: null,
      });
    }

    // Buat kategori baru
    const newCategory = await Category.create({
      name,
      slug: generatedSlug,
      description,
    });

    res.status(201).json({
      success: true,
      message: "Kategori berhasil ditambahkan.",
      data: newCategory,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan pada server.",
      data: config.nodeEnv === "development" ? error : undefined, //janlup ganti pas udah mau di deploy
    });
  }
};

export const getCategories = async (_req: Request, res: Response) => {
  try {
    const categories = await Category.findAll();

    res.status(200).json({
      success: true,
      message: "Data kategori berhasil diambil.",
      data: categories,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan pada server.",
      data: config.nodeEnv === "development" ? error : undefined, //janlup ganti pas udah mau di deploy
    });
  }
};

export const getCategoryByName = async (req: Request, res: Response) => {
  const { name } = req.params;

  try {
    const category = await Category.findOne({ where: { name } });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Kategori tidak ditemukan.",
        data: null,
      });
    }

    res.status(200).json({
      success: true,
      message: "Data kategori berhasil diambil.",
      data: category,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan pada server.",
      data: config.nodeEnv === "development" ? error : undefined, //janlup ganti pas udah mau di deploy
    });
  }
};

export const deleteCategory = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const category = await Category.findByPk(id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Kategori tidak ditemukan.",
        data: null,
      });
    }

    await category.destroy();

    res.status(200).json({
      success: true,
      message: "Kategori berhasil dihapus.",
      data: null,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan pada server.",
      data: config.nodeEnv === "development" ? error : undefined, //janlup ganti pas udah mau di deploy
    });
  }
};

export const updateCategory = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, slug, description } = req.body;

  try {
    const category = await Category.findByPk(id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Kategori tidak ditemukan.",
        data: null,
      });
    }

    // Cek apakah nama kategori baru sudah ada (jika nama diubah)
    if (name && name !== category.name) {
      const existingCategory = await Category.findOne({ where: { name } });
      if (existingCategory) {
        return res.status(400).json({
          success: false,
          message: "Kategori dengan nama tersebut sudah ada.",
          data: null,
        });
      }
    }

    let generatedSlug = "";

    // buat slug otomatis
    if (!slug) {
      generatedSlug = slug
        ? slugify(slug, { lower: true, strict: true })
        : slugify(name, { lower: true, strict: true });
    }

    // Update kategori
    category.name = name || category.name;
    category.slug = generatedSlug || category.slug;
    // category.description = description || category.description;

    await category.save();

    res.status(200).json({
      success: true,
      message: "Kategori berhasil diperbarui.",
      data: category,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan pada server.",
      data: config.nodeEnv === "development" ? error : undefined, //janlup ganti pas udah mau di deploy
    });
  }
};

export const getCategoryById = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const category = await Category.findByPk(id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Kategori tidak ditemukan.",
        data: null,
      });
    }

    res.status(200).json({
      success: true,
      message: "Data kategori berhasil diambil.",
      data: category,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan pada server.",
      data: config.nodeEnv === "development" ? error : undefined, //janlup ganti pas udah mau di deploy
    });
  }
};

export const getCategoriesWithProducts = async (
  _req: Request,
  res: Response
) => {
  try {
    const categories = await Category.findAll({
      include: ["products"], // Asumsikan relasi sudah didefinisikan di model
    });

    res.status(200).json({
      success: true,
      message: "Data kategori dengan produk berhasil diambil.",
      data: categories,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan pada server.",
      data: config.nodeEnv === "development" ? error : undefined, //janlup ganti pas udah mau di deploy
    });
  }
};

export const getProductsByCategoryId = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const category = await Category.findByPk(id, {
      include: ["products"], // Asumsikan relasi sudah didefinisikan di model
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Kategori tidak ditemukan.",
        data: null,
      });
    }

    res.status(200).json({
      success: true,
      message: "Data produk dalam kategori berhasil diambil.",
      data: category.products,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan pada server.",
      data: config.nodeEnv === "development" ? error : undefined, //janlup ganti pas udah mau di deploy
    });
  }
};
