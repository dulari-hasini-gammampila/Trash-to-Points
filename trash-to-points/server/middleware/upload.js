/**
 * Here's what this is for:
 * Configures Multer for submission image uploads: destination folder, filenames, size limits.
 *
 * How it fits in:
 * Used by submission routes so photos land under /uploads and can be served statically by Express.
 *
 * Why it matters:
 * Bad paths or limits break photo proof — the core evidence for awarding points disappears or fails.
 */
import fs from "fs";
import path from "path";
import crypto from "crypto";
import multer from "multer";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadDir = path.join(__dirname, "../uploads");
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname || "").toLowerCase();
    const safe = [".jpg", ".jpeg", ".png", ".gif", ".webp"].includes(ext) ? ext : ".jpg";
    cb(null, `${Date.now()}-${crypto.randomBytes(6).toString("hex")}${safe}`);
  },
});

function fileFilter(_req, file, cb) {
  const ok = /^image\//.test(file.mimetype);
  cb(null, ok);
}

export const uploadProof = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter,
});
