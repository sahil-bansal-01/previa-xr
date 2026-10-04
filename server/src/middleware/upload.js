import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDir = path.join(__dirname, '../../uploads');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const rawEnvId = req.headers['x-environment-id'] || req.query.environmentId || req.body.environmentId;
    const envId = rawEnvId ? String(rawEnvId).replace(/[^a-zA-Z0-9_-]/g, '_') : ('env_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 7));
    req.environmentId = envId;

    const subfolder = req.query.type === 'frame' ? 'frames' : 'original';
    const targetDir = path.join(uploadDir, envId, subfolder);
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }
    cb(null, targetDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const sanitizedBase = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    const uniqueSuffix = Date.now() + '_' + Math.random().toString(36).substring(2, 7);
    cb(null, `${sanitizedBase}_${uniqueSuffix}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedMime = [
    'video/mp4',
    'video/webm',
    'video/quicktime',
    'image/png',
    'image/jpeg',
    'image/jpg',
    'image/webp'
  ];
  if (allowedMime.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Unsupported file type: ${file.mimetype}. Allowed: MP4, WebM, MOV, PNG, JPG/JPEG`));
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100 MB max per file
    files: 20 // max 20 files
  }
});
