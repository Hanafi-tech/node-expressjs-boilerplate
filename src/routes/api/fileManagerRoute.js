'use strict';

const express = require('express');
const path    = require('path');
const fs      = require('fs');
const mime    = require('mime-types');
const res_    = require('@/lib/utils/response.js');

const router = express.Router();

const UPLOAD_DIR = path.join(__dirname, '../../public/upload');
const IMAGE_DIR  = path.join(__dirname, '../../public/image');

const _listDir = (dir) => {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .filter(f => !f.startsWith('.'))
    .map(filename => {
      const filePath = path.join(dir, filename);
      const stat     = fs.statSync(filePath);
      return {
        filename,
        size:     stat.size,
        sizeMB:   (stat.size / 1024 / 1024).toFixed(2),
        mimeType: mime.lookup(filename) || 'application/octet-stream',
        createdAt: stat.birthtime,
        updatedAt: stat.mtime,
      };
    })
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
};

/**
 * @swagger
 * tags:
 *   name: File Manager
 *   description: Manajemen file yang sudah diupload
 */

/**
 * @swagger
 * /files:
 *   get:
 *     summary: Daftar semua file (image + upload)
 *     tags: [File Manager]
 *     responses:
 *       200: { description: OK }
 */
router.get('/', (req, res) => {
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
 *     summary: Hapus file
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
 *       404: { description: File tidak ditemukan }
 */
router.delete('/:folder/:filename', (req, res) => {
  try {
    const { folder, filename } = req.params;

    // Sanitasi: cegah path traversal
    const safeName = path.basename(filename);
    const baseDir  = folder === 'image' ? IMAGE_DIR : UPLOAD_DIR;

    if (!['image', 'upload'].includes(folder)) {
      return res_.badRequest(res, 'Folder tidak valid. Gunakan: image atau upload');
    }

    const filePath = path.join(baseDir, safeName);
    if (!filePath.startsWith(baseDir)) {
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
