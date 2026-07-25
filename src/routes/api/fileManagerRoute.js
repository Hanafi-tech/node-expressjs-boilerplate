'use strict';

const express = require('express');
const path    = require('path');
const fs      = require('fs');
const mime    = require('mime-types');
const res_    = require('@/lib/utils/response.js');
const requireSuperAdmin = require('@/middleware/requireSuperAdmin.js');

const router = express.Router();

const UPLOAD_DIR = path.resolve(__dirname, '../../public/upload');
const IMAGE_DIR  = path.resolve(__dirname, '../../public/image');

const DIR_MAP = { image: IMAGE_DIR, upload: UPLOAD_DIR };

const _listDir = (dir) => {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .filter(f => !f.startsWith('.'))
    .map(filename => {
      const filePath = path.join(dir, filename);
      const stat     = fs.statSync(filePath);
      return {
        filename,
        size:      stat.size,
        sizeMB:    (stat.size / 1024 / 1024).toFixed(2),
        mimeType:  mime.lookup(filename) || 'application/octet-stream',
        createdAt: stat.birthtime,
        updatedAt: stat.mtime,
      };
    })
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
};

/**
 * @swagger
 * /files:
 *   get:
 *     summary: Daftar semua file (superadmin only)
 *     tags: [File Manager]
 *     responses:
 *       200: { description: OK }
 */
router.get('/', requireSuperAdmin, (req, res) => {
  try {
    const images  = _listDir(IMAGE_DIR).map(f  => ({ ...f, folder: 'image',  url: `/img/${f.filename}` }));
    const uploads = _listDir(UPLOAD_DIR).map(f => ({ ...f, folder: 'upload', url: `/file/${f.filename}` }));
    return res_.success(res, { images, uploads, total: images.length + uploads.length });
  } catch (err) {
    return res_.serverError(res, err.message);
  }
});

/**
 * @swagger
 * /files/{folder}/{filename}:
 *   delete:
 *     summary: Hapus file (superadmin only)
 *     tags: [File Manager]
 *     parameters:
 *       - in: path
 *         name: folder
 *         required: true
 *         schema: { type: string, enum: [image, upload] }
 *       - in: path
 *         name: filename
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: File berhasil dihapus }
 *       403: { description: Akses ditolak }
 *       404: { description: File tidak ditemukan }
 */
router.delete('/:folder/:filename', requireSuperAdmin, (req, res) => {
  try {
    const { folder } = req.params;

    if (!DIR_MAP[folder]) {
      return res_.badRequest(res, 'Folder tidak valid. Gunakan: image atau upload');
    }

    const baseDir  = DIR_MAP[folder];
    // path.resolve mencegah path traversal (../, %2F, dll)
    const safeName = path.basename(req.params.filename);
    const filePath = path.resolve(baseDir, safeName);

    // Double-check: pastikan path hasil resolve masih di dalam baseDir
    if (!filePath.startsWith(baseDir + path.sep) && filePath !== baseDir) {
      return res_.forbidden(res, 'Akses tidak diizinkan');
    }

    if (!fs.existsSync(filePath)) {
      return res_.notFound(res, `File '${safeName}' tidak ditemukan`);
    }

    fs.unlinkSync(filePath);
    return res_.success(res, null, `File '${safeName}' berhasil dihapus`);
  } catch (err) {
    return res_.serverError(res, err.message);
  }
});

module.exports = router;
