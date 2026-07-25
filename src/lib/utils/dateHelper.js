'use strict';

/**
 * Timezone-aware Date Helper
 * Mendukung WIB (UTC+7), WITA (UTC+8), WIT (UTC+9)
 */

const TIMEZONES = {
  WIB:  'Asia/Jakarta',   // UTC+7
  WITA: 'Asia/Makassar',  // UTC+8
  WIT:  'Asia/Jayapura',  // UTC+9
};

const DEFAULT_TZ = TIMEZONES.WIB;

/**
 * Format Date ke string dengan timezone tertentu
 * @param {Date|string} date
 * @param {string} tz - Timezone string (default: Asia/Jakarta)
 * @param {string} format - 'datetime' | 'date' | 'time' | 'iso'
 * @returns {string}
 */
const format = (date, tz = DEFAULT_TZ, fmt = 'datetime') => {
  const d = date ? new Date(date) : new Date();
  const options = { timeZone: tz };

  switch (fmt) {
    case 'date':
      return d.toLocaleDateString('id-ID', { ...options, year: 'numeric', month: '2-digit', day: '2-digit' });
    case 'time':
      return d.toLocaleTimeString('id-ID', { ...options, hour: '2-digit', minute: '2-digit', second: '2-digit' });
    case 'iso':
      return new Date(d.toLocaleString('en-US', { timeZone: tz })).toISOString();
    default: // datetime
      return d.toLocaleString('id-ID', {
        ...options,
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit', second: '2-digit',
      });
  }
};

/**
 * Dapatkan waktu sekarang di timezone tertentu
 * @param {string} tz
 * @returns {Date}
 */
const now = (tz = DEFAULT_TZ) => {
  return new Date(new Date().toLocaleString('en-US', { timeZone: tz }));
};

/**
 * Tambah hari ke tanggal
 * @param {Date|string} date
 * @param {number} days
 * @returns {Date}
 */
const addDays = (date, days) => {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
};

/**
 * Tambah jam ke tanggal
 * @param {Date|string} date
 * @param {number} hours
 * @returns {Date}
 */
const addHours = (date, hours) => {
  const d = new Date(date);
  d.setHours(d.getHours() + hours);
  return d;
};

/**
 * Cek apakah tanggal sudah lewat
 * @param {Date|string} date
 * @returns {boolean}
 */
const isExpired = (date) => new Date() > new Date(date);

/**
 * Hitung selisih dalam hari antara dua tanggal
 * @param {Date|string} from
 * @param {Date|string} to
 * @returns {number}
 */
const diffDays = (from, to) => {
  const msPerDay = 1000 * 60 * 60 * 24;
  return Math.round((new Date(to) - new Date(from)) / msPerDay);
};

/**
 * Dapatkan awal dan akhir hari (00:00:00 - 23:59:59) dalam timezone
 * @param {Date|string} date
 * @param {string} tz
 * @returns {{ start: Date, end: Date }}
 */
const getDayRange = (date = new Date(), tz = DEFAULT_TZ) => {
  const d    = new Date(date.toLocaleString('en-US', { timeZone: tz }));
  const start = new Date(d); start.setHours(0, 0, 0, 0);
  const end   = new Date(d); end.setHours(23, 59, 59, 999);
  return { start, end };
};

/**
 * Dapatkan awal dan akhir bulan dalam timezone
 * @param {number} year
 * @param {number} month  - 1-indexed
 * @param {string} tz
 * @returns {{ start: Date, end: Date }}
 */
const getMonthRange = (year, month, tz = DEFAULT_TZ) => {
  const start = new Date(Date.UTC(year, month - 1, 1));
  const end   = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));
  return { start, end };
};

module.exports = {
  TIMEZONES,
  DEFAULT_TZ,
  format,
  now,
  addDays,
  addHours,
  isExpired,
  diffDays,
  getDayRange,
  getMonthRange,
};
