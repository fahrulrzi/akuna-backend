import type { Request, Response } from "express";
import { Product } from "../models/Product.js";
import { storageService } from "../services/storage.service.js";
import { config } from "../config/index.js";
import { Category } from "../models/Category.js";
import { Affiliate } from "../models/Affiliate.js";

interface AuthRequest extends Request {
  user?: { id: number; role: string };
}

export const addProduct = async (req: Request, res: Response) => {
  try {
    // Destructure setelah validasi
    const {
      name,
      categoryId,
      description,
      price,
      stock,
      weight,
      length,
      width,
      height,
    } = req.body || {};
    const files = req.files as Express.Multer.File[];

    // Validasi field wajib
    if (!name || !categoryId || !price) {
      return res.status(400).json({
        success: false,
        message: "Name, categoryId, and price are required.",
        data: null,
      });
    }

    const category = await Category.findByPk(categoryId);

    if (!category) {
      return res.status(400).json({
        success: false,
        message: "Kategori tidak ditemukan.",
        data: null,
      });
    }

    let imageUrls: string[] = [];
    let imageKeys: string[] = [];

    if (files && files.length > 0) {
      const uploadResults = await storageService.uploadMultiple(
        files,
        "products"
      );
      imageUrls = uploadResults.map((result) => result.url);
      imageKeys = uploadResults.map((result) => result.key);
    }

    const newProduct = await Product.create({
      name,
      categoryId: parseInt(categoryId),
      description: description || "",
      price: parseFloat(price),
      stock: stock ? parseInt(stock) : 0,
      weight: weight ? parseInt(weight) : 0,
      length: length ? parseInt(length) : 0,
      width: width ? parseInt(width) : 0,
      height: height ? parseInt(height) : 0,
      images: imageUrls,
      imageKeys: imageKeys,
    });

    res.status(201).json({
      success: true,
      message: "Produk berhasil ditambahkan.",
      data: newProduct,
    });
  } catch (error) {
    console.error("Error in addProduct:", error);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan pada server.",
      data: process.env.NODE_ENV === "development" ? error : undefined,
    });
  }
};

export const getProducts = async (_req: Request, res: Response) => {
  try {
    const products = await Product.findAll({
      include: ["category"],
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json({
      success: true,
      message: "Data produk berhasil diambil.",
      data: products,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan pada server.",
      data: config.nodeEnv === "development" ? error : undefined, //janlup ganti pas udah mau di deploy
    });
  }
};

export const getProductById = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const product = await Product.findByPk(id, {
      include: ["category"],
    });

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
      data: config.nodeEnv === "development" ? error : undefined, //janlup ganti pas udah mau di deploy
    });
  }
};

export const getProductsByCategory = async (req: Request, res: Response) => {
  const { category } = req.params;

  try {
    // const products = await Product.findAll({
    //   where: { slug },
    //   include: ["category"],
    // });

    const categoryId = await Category.findOne({
      where: { slug: category },
    });

    if (!categoryId) {
      return res.status(404).json({
        success: false,
        message: "Kategori tidak ditemukan.",
        data: null,
      });
    }

    const products = await Product.findAll({
      where: { categoryId: categoryId.id },
      include: ["category"],
      order: [["createdAt", "DESC"]],
    });

    if (products.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Tidak ada produk ditemukan untuk kategori ini.",
        data: null,
      });
    }

    res.status(200).json({
      success: true,
      message: "Data produk berhasil diambil.",
      data: products,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan pada server.",
      data: config.nodeEnv === "development" ? error : undefined, //janlup ganti pas udah mau di deploy
    });
  }
};

export const updateProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      name,
      categoryId,
      description,
      price,
      stock,
      deleteImages,
      weight,
      length,
      width,
      height,
    } = req.body;
    const files = req.files as any[];

    const product = await Product.findByPk(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Produk tidak ditemukan.",
        data: null,
      });
    }

    if (categoryId !== undefined) {
      const category = await Category.findByPk(categoryId);

      if (!category) {
        return res.status(400).json({
          success: false,
          message: "Kategori tidak ditemukan.",
          data: null,
        });
      }
    }

    let currentImages = product.images || [];
    let currentImageKeys = product.imageKeys || [];

    // Handle new image uploads
    if (deleteImages) {
      try {
        const deleteIndices = JSON.parse(deleteImages);

        if (Array.isArray(deleteIndices) && deleteIndices.length > 0) {
          const keysToDelete = deleteIndices
            .map((idx: number) => currentImageKeys[idx])
            .filter(Boolean);

          if (keysToDelete.length > 0) {
            await storageService.deleteMultiple(
              keysToDelete.filter(
                (key): key is string => typeof key === "string"
              )
            );
          }

          currentImages = currentImages.filter(
            (_: any, idx: number) => !deleteIndices.includes(idx)
          );
          currentImageKeys = currentImageKeys.filter(
            (_: any, idx: number) => !deleteIndices.includes(idx)
          );
        }
      } catch (parseError) {
        console.error("Error parsing deleteImages:", parseError);
      }
    }

    if (files && files.length > 0) {
      const uploadResults = await storageService.uploadMultiple(
        files,
        "products"
      );
      currentImages.push(...uploadResults.map((result) => result.url));
      currentImageKeys.push(...uploadResults.map((result) => result.key));
    }

    // Update product
    await product.update({
      name: name || product.name,
      categoryId: categoryId ? parseInt(categoryId) : product.categoryId,
      description:
        description !== undefined ? description : product.description,
      price: price ? parseFloat(price) : product.price,
      stock: stock !== undefined ? parseInt(stock) : product.stock,
      weight: weight ? parseInt(weight) : product.weight,
      length: length ? parseInt(length) : product.length,
      width: width ? parseInt(width) : product.width,
      height: height ? parseInt(height) : product.height,
      images: currentImages,
      imageKeys: currentImageKeys,
    });

    // Reload to get updated associations
    await product.reload({ include: [Category] });

    res.status(200).json({
      success: true,
      message: "Produk berhasil diperbarui.",
      data: product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan pada server.",
      data: config.nodeEnv === "development" ? error : undefined,
    });
  }
};

export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const product = await Product.findByPk(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Produk tidak ditemukan.",
        data: null,
      });
    }

    // Menghapus gambar dari storage jika ada
    if (product.imageKeys && product.imageKeys.length > 0) {
      await storageService.deleteMultiple(product.imageKeys);
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
      data: config.nodeEnv === "development" ? error : undefined, //janlup ganti pas udah mau di deploy
    });
  }
};

export const shareProductAffiliate = async (
  req: AuthRequest,
  res: Response
) => {
  const { productId } = req.params;
  const userId = req.user?.id;

  try {
    const product = await Product.findByPk(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Produk tidak ditemukan.",
        data: null,
      });
    }

    const affiliateUser = await Affiliate.findOne({
      where: { userId: userId },
    });

    const affiliateLink = `${config.frontendUrl}/product/${product.id}?ref=${affiliateUser?.referralCode}`;

    res.status(200).json({
      success: true,
      message: "Link affiliate produk berhasil dibuat.",
      data: {
        affiliateLink,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan pada server.",
      data: config.nodeEnv === "development" ? error : undefined, //janlup ganti pas udah mau di deploy
    });
  }
};
