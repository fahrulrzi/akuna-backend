// src/services/storage.service.ts
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import fs from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { config } from "../config/index.js";

// Type definition untuk uploaded file
interface UploadedFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  buffer: Buffer;
  size: number;
}

interface UploadResult {
  url: string;
  key: string;
}

interface StorageConfig {
  type: "local" | "r2";
  localPath?: string;
  baseUrl?: string;
  r2?: {
    accountId: string;
    accessKeyId: string;
    secretAccessKey: string;
    bucketName: string;
    publicUrl?: string;
  };
}

class StorageService {
  private config: StorageConfig;
  private s3Client?: S3Client;

  constructor() {
    this.config = config.objectStorage;

    if (this.config.type === "r2") {
      this.initR2Client();
    }
  }

  private initR2Client() {
    if (!this.config.r2) {
      throw new Error("R2 configuration is missing");
    }

    const endpoint = `https://${this.config.r2.accountId}.r2.cloudflarestorage.com`;

    this.s3Client = new S3Client({
      region: "auto",
      endpoint,
      credentials: {
        accessKeyId: this.config.r2.accessKeyId,
        secretAccessKey: this.config.r2.secretAccessKey,
      },
    });
  }

  async uploadFile(
    file: UploadedFile,
    folder: string = "products"
  ): Promise<UploadResult> {
    if (this.config.type === "r2") {
      return this.uploadToR2(file, folder);
    }
    return this.uploadToLocal(file, folder);
  }

  async uploadMultiple(
    files: UploadedFile[],
    folder: string = "products"
  ): Promise<UploadResult[]> {
    const uploadPromises = files.map((file) => this.uploadFile(file, folder));
    return Promise.all(uploadPromises);
  }

  private async uploadToLocal(
    file: UploadedFile,
    folder: string
  ): Promise<UploadResult> {
    const ext = path.extname(file.originalname);
    const filename = `${uuidv4()}${ext}`;
    const folderPath = path.join(this.config.localPath!, folder);
    const filePath = path.join(folderPath, filename);

    // Buat folder jika belum ada
    await fs.mkdir(folderPath, { recursive: true });

    // Simpan file
    await fs.writeFile(filePath, file.buffer);

    const url = `${this.config.baseUrl}/${folder}/${filename}`;
    const key = `${folder}/${filename}`;

    return { url, key };
  }

  private async uploadToR2(
    file: UploadedFile,
    folder: string
  ): Promise<UploadResult> {
    if (!this.s3Client || !this.config.r2) {
      throw new Error("R2 client not initialized");
    }

    const ext = path.extname(file.originalname);
    const filename = `${uuidv4()}${ext}`;
    const key = `${folder}/${filename}`;

    const command = new PutObjectCommand({
      Bucket: this.config.r2.bucketName,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    });

    await this.s3Client.send(command);

    // Jika ada public URL, gunakan itu. Jika tidak, generate signed URL
    let url: string;
    if (this.config.r2.publicUrl) {
      url = `${this.config.r2.publicUrl}/${key}`;
    } else {
      // Generate signed URL yang valid selama 7 hari
      const getCommand = new GetObjectCommand({
        Bucket: this.config.r2.bucketName,
        Key: key,
      });
      url = await getSignedUrl(this.s3Client, getCommand, {
        expiresIn: 604800,
      });
    }

    return { url, key };
  }

  async deleteFile(key: string): Promise<void> {
    if (this.config.type === "r2") {
      await this.deleteFromR2(key);
    } else {
      await this.deleteFromLocal(key);
    }
  }

  async deleteMultiple(keys: string[]): Promise<void> {
    const deletePromises = keys.map((key) => this.deleteFile(key));
    await Promise.all(deletePromises);
  }

  private async deleteFromLocal(key: string): Promise<void> {
    const filePath = path.join(this.config.localPath!, key);
    try {
      await fs.unlink(filePath);
    } catch (error: any) {
      if (error.code !== "ENOENT") {
        throw error;
      }
    }
  }

  private async deleteFromR2(key: string): Promise<void> {
    if (!this.s3Client || !this.config.r2) {
      throw new Error("R2 client not initialized");
    }

    const command = new DeleteObjectCommand({
      Bucket: this.config.r2.bucketName,
      Key: key,
    });

    await this.s3Client.send(command);
  }
}

export const storageService = new StorageService();
