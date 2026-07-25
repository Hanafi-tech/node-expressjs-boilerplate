'use strict';

/**
 * SAMPLE: File Upload (multer + mime-types + nanoid)
 * ────────────────────────────────────────────────────
 * multer      — upload file via multipart/form-data (alternatif express-fileupload)
 * mime-types  — deteksi MIME type dari nama/buffer file
 * nanoid      — generate ID unik untuk nama file (aman untuk URL)
 *
 * Boilerplate ini sudah pakai express-fileupload di app.js.
 * Sample ini menunjukkan cara pakai multer jika Anda lebih prefer diskStorage.
 *
 * Cara pakai di route:
 *   const { uploadSingle, uploadMultiple } = require('@my_module/samples/upload.sample');
 *   router.post('/upload', uploadSingle('image'), controller.uploadHandler);
 */

const multer    = require('multer');
const mime      = require('mime-types');
const path      = require('path');
const fs        = require('fs');

// ── Folder upload default ─────────────────────────────────────────
const UPLOAD_DIR = path.join(__dirname, '../../public/upload');
const IMAGE_DIR  = path.join(__dirname, '../../public/image');

// Pastikan folder ada
[UPLOAD_DIR, IMAGE_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// ─────────────────────────────────────────────────────────────────
// 1. KONFIGURASI STORAGE
// ─────────────────────────────────────────────────────────────────
const makeStorage = (destination) => multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, destination),
  filename: (_req, file, cb) => {
    // nanoid: ID unik 10 char + timestamp + ekstensi asli
    const { nanoid } = require('nanoid');
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${nanoid(10)}-${Date.now()}${ext}`);
  },
});

// ─────────────────────────────────────────────────────────────────
// 2. FILTER MIME TYPE
// ─────────────────────────────────────────────────────────────────
const imageFilter = (_req, file, cb) => {
  const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  if (allowed.includes(file.mimetype)) return cb(null, true);
  cb(new Error('Hanya file gambar (JPEG, PNG, WebP, GIF) yang diizinkan.'));
};

const documentFilter = (_req, file, cb) => {
  const allowed = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ];
  if (allowed.includes(file.mimetype)) return cb(null, true);
  cb(new Error('Hanya file PDF, Excel, atau Word yang diizinkan.'));
};

// ─────────────────────────────────────────────────────────────────
// 3. INSTANCE MULTER SIAP PAKAI
// ─────────────────────────────────────────────────────────────────

/** Upload 1 gambar, field name bebas */
const uploadImage = multer({
  storage:  makeStorage(IMAGE_DIR),
  fileFilter: imageFilter,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2 MB
});

/** Upload 1 dokumen (PDF/Excel/Word) */
const uploadDocument = multer({
  storage:  makeStorage(UPLOAD_DIR),
  fileFilter: documentFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
});

/** Upload ke memory buffer (tidak disimpan ke disk, cocok untuk proses langsung) */
const uploadToMemory = multer({
  storage: multer.memoryStorage(),
  limits:  { fileSize: 10 * 1024 * 1024 },
});

// ─────────────────────────────────────────────────────────────────
// 4. HELPER: deteksi ekstensi dari MIME type (mime-types)
// ─────────────────────────────────────────────────────────────────
/**
 * const ext = getExtension('image/png');     // → 'png'
 * const type = getMimeType('photo.jpg');     // → 'image/jpeg'
 */
const getExtension = (mimeType) => mime.extension(mimeType) || 'bin';
const getMimeType  = (filename) => mime.lookup(filename)    || 'application/octet-stream';

// ─────────────────────────────────────────────────────────────────
// 5. CONTOH PENGGUNAAN DI ROUTE & CONTROLLER
// ─────────────────────────────────────────────────────────────────
/**
 * ── Route ──────────────────────────────────────────────────────
 * const { uploadImage, uploadDocument } = require('@my_module/samples/upload.sample');
 *
 * router.post('/upload/image',    uploadImage.single('image'),       ctrl.uploadImage);
 * router.post('/upload/document', uploadDocument.single('document'), ctrl.uploadDocument);
 * router.post('/upload/multi',    uploadImage.array('images', 5),    ctrl.uploadMultiple);
 *
 * ── Controller ─────────────────────────────────────────────────
 * const uploadImage = async (req, res) => {
 *   if (!req.file) return res.status(400).json({ msg: 'File wajib diupload.' });
 *
 *   return res.json({
 *     msg:      'Upload berhasil.',
 *     filename: req.file.filename,
 *     url:      `/img/${req.file.filename}`,
 *     size:     req.file.size,
 *     mime:     req.file.mimetype,
 *   });
 * };
 *
 * ── Error handler untuk multer ──────────────────────────────────
 * // Tambahkan di routes setelah multer middleware:
 * const handleMulterError = (err, req, res, next) => {
 *   if (err instanceof multer.MulterError) {
 *     if (err.code === 'LIMIT_FILE_SIZE') return res.status(413).json({ msg: 'File terlalu besar.' });
 *     return res.status(400).json({ msg: err.message });
 *   }
 *   if (err) return res.status(400).json({ msg: err.message });
 *   next();
 * };
 */

// ─────────────────────────────────────────────────────────────────
// 6. NANOID — generate unique ID
// ─────────────────────────────────────────────────────────────────
/**
 * import { nanoid } from 'nanoid';  // ESM
 * const { nanoid } = require('nanoid'); // CJS
 *
 * Penggunaan:
 *   nanoid()      // → 'V1StGXR8_Z5jdHi6B-myT'  (21 char, default)
 *   nanoid(10)    // → 'IRFa-VaY2b'               (10 char)
 *   nanoid(6)     // → 'abc123'                   (6 char, untuk kode pendek)
 *
 * Contoh di controller:
 *   const { nanoid } = require('nanoid');
 *   const orderCode = `ORD-${nanoid(8).toUpperCase()}`;  // ORD-AB12CD34
 */

module.exports = { uploadImage, uploadDocument, uploadToMemory, getExtension, getMimeType };
