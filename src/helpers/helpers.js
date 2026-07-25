'use strict';

const path = require('path');
const fs   = require('fs');

/**
 * Parse string angka (format lokal ID: titik ribuan, koma desimal) → number
 * @param {*} value
 * @returns {number}
 */
const parseNumber = (value) => {
  if (value === null || value === undefined || value === '') return 0;
  if (typeof value === 'number' && Number.isFinite(value)) return value;

  const str = String(value).trim().replace(/[^\d\-,.]/g, '');

  if (str.includes('.') && str.includes(',')) {
    const n = parseFloat(str.replace(/\./g, '').replace(',', '.'));
    return Number.isFinite(n) ? n : 0;
  }
  if (str.includes(',')) {
    const n = parseFloat(str.replace(',', '.'));
    return Number.isFinite(n) ? n : 0;
  }

  const n = parseFloat(str);
  return Number.isFinite(n) ? n : 0;
};

/**
 * Format number ke string currency (Intl.NumberFormat)
 * @param {number|string} value
 * @param {string} locale   default 'id-ID'
 * @param {string} currency default 'IDR' — pass null untuk tanpa simbol mata uang
 */
const formatCurrency = (value, locale = 'id-ID', currency = null) => {
  const number = parseNumber(value);
  const opts = currency
    ? { style: 'currency', currency, minimumFractionDigits: 0, maximumFractionDigits: 0 }
    : { minimumFractionDigits: 2, maximumFractionDigits: 2 };
  return new Intl.NumberFormat(locale, opts).format(number);
};

/**
 * Cek apakah value kosong / falsy
 * @param {*} data
 * @returns {boolean}
 */
const isEmpty = (data) => {
  if (!data) return true;
  if (Array.isArray(data)) return data.length === 0;
  if (typeof data === 'object') return Object.keys(data).length === 0;
  return false;
};

/**
 * Baca file gambar dari public/image dan kembalikan sebagai base64 atau path absolut
 * @param {{ asBase64?: boolean, image?: string }} options
 * @returns {string|null}
 */
const getImagePath = (options = { asBase64: false, image: 'logo.png' }) => {
  const filePath = path.join(__dirname, '..', 'public', 'image', options.image);
  try {
    if (!fs.existsSync(filePath)) {
      console.warn('[helpers] Image not found:', filePath);
      return null;
    }
    const buffer = fs.readFileSync(filePath);
    if (options.asBase64) {
      const ext = path.extname(filePath).slice(1) || 'png';
      return `data:image/${ext};base64,${buffer.toString('base64')}`;
    }
    return filePath;
  } catch (err) {
    console.error('[helpers] Error reading image:', err.message);
    return null;
  }
};

/**
 * Generate string random alphanumerik
 * @param {number} length
 * @returns {string}
 */
const randomString = (length = 8) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
};

/**
 * Pagination — parse query params dan kembalikan { page, limit, offset }
 * @param {{ page?: string, pageSize?: string }} query
 * @param {number} defaultSize
 */
const parsePagination = (query, defaultSize = 10) => {
  const page   = Math.max(1, parseInt(query.page,     10) || 1);
  const limit  = Math.max(1, Math.min(100, parseInt(query.pageSize, 10) || defaultSize));
  const offset = (page - 1) * limit;
  return { page, limit, offset };
};

module.exports = { parseNumber, formatCurrency, isEmpty, getImagePath, randomString, parsePagination };
