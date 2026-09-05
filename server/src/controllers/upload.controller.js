import path from 'node:path';
import multer from 'multer';
import fs from 'node:fs';
import { v2 as cloudinary } from 'cloudinary';
import { errors } from '../utils/apiError.js';
import { asyncHandler } from '../utils/apiError.js';
import { ok } from '../utils/response.js';
import { config } from '../config/index.js';

// Local disk fallback storage (used when Cloudinary is not configured)
const UPLOADS_DIR = path.resolve(process.cwd(), 'uploads');
fs.mkdirSync(UPLOADS_DIR, { recursive: true });

const diskStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOADS_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname) || '';
    const base = path.basename(file.originalname, ext).replace(/[^a-z0-9]/gi, '_').slice(0, 60);
    cb(null, `${Date.now()}-${base}${ext}`);
  }
});

const ACCEPTED_EXTENSIONS = new Set([
  '.jpg', '.jpeg', '.png', '.webp', '.gif', '.pdf', '.heic'
]);

const fileFilter = (_req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (!ACCEPTED_EXTENSIONS.has(ext)) {
    return cb(errors.validation(`Unsupported file type: ${ext}. Allowed: jpg, jpeg, png, webp, gif, pdf, heic`));
  }
  return cb(null, true);
};

const upload = multer({
  storage: diskStorage,
  limits: { fileSize: config.maxFileSizeMb * 1024 * 1024 },
  fileFilter
});

async function storeToCloud(file) {
  cloudinary.config({ url: config.cloudinaryUrl });
  const result = await cloudinary.uploader.upload(file.path, {
    resource_type: file.mimetype === 'application/pdf' ? 'raw' : 'image'
  });
  return result.secure_url;
}

// Middleware: accepts single `file` field
export const uploadSingle = upload.single('file');

// POST /uploads (multipart form-data, `file` field)
export const uploadFile = asyncHandler(async (req, res) => {
  if (!req.file) throw errors.validation('file field is required (multipart/form-data)');

  try {
    if (config.cloudinaryUrl) {
      const url = await storeToCloud(req.file);
      fs.promises.unlink(req.file.path).catch(() => {});
      return ok(res, { url, provider: 'cloudinary', size: req.file.size });
    }
    const url = `/uploads/${req.file.filename}`;
    return ok(res, { url, provider: 'local', size: req.file.size });
  } catch (err) {
    fs.promises.unlink(req.file.path).catch(() => {});
    throw err;
  }
});

// Serve local uploads only in development (replaced by CDN in production)
export { UPLOADS_DIR };