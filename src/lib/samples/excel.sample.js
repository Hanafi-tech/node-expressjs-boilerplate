'use strict';

/**
 * SAMPLE: Excel (exceljs + xlsx + adm-zip)
 * ──────────────────────────────────────────
 * exceljs  — generate & baca Excel dengan style (recommended)
 * xlsx     — parse Excel sederhana, cocok untuk import data
 * adm-zip  — zip/unzip file (misal: export multiple sheet jadi .zip)
 *
 * Cara pakai di controller:
 *   const excel = require('@my_module/samples/excel.sample');
 */

const ExcelJS = require('exceljs');
const XLSX    = require('xlsx');
const AdmZip  = require('adm-zip');
const path    = require('path');
const fs      = require('fs');

// ─────────────────────────────────────────────────────────────────
// 1. GENERATE Excel dan kirim sebagai response download (ExcelJS)
// ─────────────────────────────────────────────────────────────────
/**
 * Contoh penggunaan di controller:
 *
 * const { generateExcel } = require('@my_module/samples/excel.sample');
 *
 * const exportHandler = async (req, res) => {
 *   const columns = [
 *     { header: 'Nama',  key: 'name',  width: 20 },
 *     { header: 'Email', key: 'email', width: 30 },
 *     { header: 'Role',  key: 'role',  width: 15 },
 *   ];
 *   const rows = [
 *     { name: 'Budi', email: 'budi@example.com', role: 'admin' },
 *     { name: 'Sari', email: 'sari@example.com', role: 'staff' },
 *   ];
 *   await generateExcel(res, 'Data Users', columns, rows, 'users-export');
 * };
 */
const generateExcel = async (res, sheetName, columns, rows, filename = 'export') => {
  const workbook  = new ExcelJS.Workbook();
  workbook.creator = 'Backend Boilerplate';

  const worksheet = workbook.addWorksheet(sheetName);
  worksheet.columns = columns;

  // Style header
  worksheet.getRow(1).font      = { bold: true };
  worksheet.getRow(1).fill      = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD9EAD3' } };
  worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };

  // Tambah data
  rows.forEach(row => worksheet.addRow(row));

  // Auto-filter
  worksheet.autoFilter = {
    from: { row: 1, column: 1 },
    to:   { row: 1, column: columns.length },
  };

  res.setHeader('Content-Disposition', `attachment; filename="${filename}.xlsx"`);
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');

  await workbook.xlsx.write(res);
  res.end();
};

// ─────────────────────────────────────────────────────────────────
// 2. IMPORT / BACA Excel yang di-upload user (xlsx)
// ─────────────────────────────────────────────────────────────────
/**
 * Contoh penggunaan di controller:
 *
 * const { parseUploadedExcel } = require('@my_module/samples/excel.sample');
 *
 * const importHandler = async (req, res) => {
 *   if (!req.files || !req.files.file)
 *     return res.status(400).json({ msg: 'File wajib diupload.' });
 *
 *   const rows = parseUploadedExcel(req.files.file.data); // buffer dari express-fileupload
 *   // rows = [{ Nama: 'Budi', Email: 'budi@example.com' }, ...]
 *   return res.json({ total: rows.length, data: rows });
 * };
 */
const parseUploadedExcel = (buffer, sheetIndex = 0) => {
  const workbook  = XLSX.read(buffer, { type: 'buffer' });
  const sheetName = workbook.SheetNames[sheetIndex];
  const sheet     = workbook.Sheets[sheetName];
  return XLSX.utils.sheet_to_json(sheet, { defval: '' });
};

// ─────────────────────────────────────────────────────────────────
// 3. ZIP multiple file menjadi satu .zip (adm-zip)
// ─────────────────────────────────────────────────────────────────
/**
 * Contoh: export beberapa file Excel sekaligus dalam satu ZIP
 *
 * const { zipFiles } = require('@my_module/samples/excel.sample');
 *
 * const exportZipHandler = async (req, res) => {
 *   const files = [
 *     { name: 'users.xlsx', path: '/tmp/users.xlsx' },
 *     { name: 'roles.xlsx', path: '/tmp/roles.xlsx' },
 *   ];
 *   zipFiles(res, files, 'export-bundle');
 * };
 */
const zipFiles = (res, files, zipName = 'download') => {
  const zip = new AdmZip();
  files.forEach(({ name, path: filePath }) => {
    zip.addLocalFile(filePath, '', name);
  });

  const buffer = zip.toBuffer();
  res.setHeader('Content-Disposition', `attachment; filename="${zipName}.zip"`);
  res.setHeader('Content-Type', 'application/zip');
  res.setHeader('Content-Length', buffer.length);
  res.end(buffer);
};

/**
 * Ekstrak file .zip yang di-upload ke folder tujuan
 */
const extractZip = (buffer, destFolder) => {
  const zip = new AdmZip(buffer);
  zip.extractAllTo(destFolder, true);
  return zip.getEntries().map(e => e.entryName);
};

module.exports = { generateExcel, parseUploadedExcel, zipFiles, extractZip };
