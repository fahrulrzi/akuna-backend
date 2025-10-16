// src/config/multer.ts
import multer from 'multer';

// Gunakan memory storage agar file tersimpan di buffer (RAM)
// Ini diperlukan karena kita akan upload ke R2 atau save ke disk secara manual
const storage = multer.memoryStorage();

// Filter untuk validasi tipe file
const fileFilter = (
  req: Express.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  // Hanya terima file gambar
  const allowedMimeTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'image/gif',
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    // File valid
    cb(null, true);
  } else {
    // File tidak valid
    cb(new Error('Invalid file type. Only JPEG, PNG, WEBP, and GIF are allowed.'));
  }
};

// Konfigurasi multer
export const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // Maksimal 5MB per file
    files: 10, // Maksimal 10 files sekaligus
  },
});

export default upload;