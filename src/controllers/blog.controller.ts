import type { Request, Response } from "express";
import { Blog } from "../models/Blog.js";
import { storageService } from "../services/storage.service.js";
import { config } from "../config/index.js";

export const createBlog = async (req: Request, res: Response) => {
  try {
    const { author, title, content } = req.body || {};
    const file = (req as any).file as Express.Multer.File | undefined;

    if (!author || !title || !content) {
      return res.status(400).json({
        success: false,
        message: "Title dan content wajib diisi.",
        data: null,
      });
    }

    let thumbnailUrl: string | null = null;
    let thumbnailKey: string | null = null;

    if (file) {
      const uploaded = await storageService.uploadFile(file, "blogs");
      thumbnailUrl = uploaded.url;
      thumbnailKey = uploaded.key;
    }

    const blog = await Blog.create({
      author,
      title,
      content,
      thumbnailUrl,
      thumbnailKey,
    });

    return res.status(201).json({
      success: true,
      message: "Blog berhasil dibuat.",
      data: blog,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan pada server.",
      data: config.nodeEnv === "development" ? error : undefined,
    });
  }
};

export const getBlogs = async (_req: Request, res: Response) => {
  try {
    const blogs = await Blog.findAll({ order: [["createdAt", "DESC"]] });
    return res.status(200).json({
      success: true,
      message: "Data blog berhasil diambil.",
      data: blogs,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan pada server.",
      data: config.nodeEnv === "development" ? error : undefined,
    });
  }
};

export const getBlogById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const blog = await Blog.findByPk(id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog tidak ditemukan.",
        data: null,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Data blog berhasil diambil.",
      data: blog,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan pada server.",
      data: config.nodeEnv === "development" ? error : undefined,
    });
  }
};

export const updateBlog = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { author, title, content, removeThumbnail } = req.body || {};
    const file = (req as any).file as Express.Multer.File | undefined;

    const blog = await Blog.findByPk(id);
    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog tidak ditemukan.",
        data: null,
      });
    }

    let nextThumbnailUrl = blog.thumbnailUrl;
    let nextThumbnailKey = blog.thumbnailKey;

    // Delete existing thumbnail if requested
    if (
      removeThumbnail &&
      (removeThumbnail === true || removeThumbnail === "true")
    ) {
      if (nextThumbnailKey) {
        await storageService.deleteFile(nextThumbnailKey);
      }
      nextThumbnailUrl = null;
      nextThumbnailKey = null;
    }

    // Replace thumbnail if new file is uploaded
    if (file) {
      if (nextThumbnailKey) {
        await storageService.deleteFile(nextThumbnailKey);
      }
      const uploaded = await storageService.uploadFile(file, "blogs");
      nextThumbnailUrl = uploaded.url;
      nextThumbnailKey = uploaded.key;
    }

    await blog.update({
      author: author !== undefined ? author : blog.author,
      title: title !== undefined ? title : blog.title,
      content: content !== undefined ? content : blog.content,
      thumbnailUrl: nextThumbnailUrl,
      thumbnailKey: nextThumbnailKey,
    });

    return res.status(200).json({
      success: true,
      message: "Blog berhasil diperbarui.",
      data: blog,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan pada server.",
      data: config.nodeEnv === "development" ? error : undefined,
    });
  }
};

export const deleteBlog = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const blog = await Blog.findByPk(id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog tidak ditemukan.",
        data: null,
      });
    }

    if (blog.thumbnailKey) {
      await storageService.deleteFile(blog.thumbnailKey);
    }

    await blog.destroy();

    return res.status(200).json({
      success: true,
      message: "Blog berhasil dihapus.",
      data: null,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan pada server.",
      data: config.nodeEnv === "development" ? error : undefined,
    });
  }
};
