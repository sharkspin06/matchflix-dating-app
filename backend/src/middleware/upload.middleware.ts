import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import path from 'path';
import { Request } from 'express';
import cloudinary from '../config/cloudinary.config';

// Cloudinary storage configuration
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    return {
      folder: 'matchflix/profiles', // Folder in Cloudinary
      allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
      transformation: [
        { width: 1000, height: 1000, crop: 'limit' }, // Limit max size
        { quality: 'auto' }, // Auto quality optimization
      ],
      public_id: `${Date.now()}-${Math.round(Math.random() * 1e9)}`, // Unique filename
    };
  },
});

const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'));
  }
};

export const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter,
});
