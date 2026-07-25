'use strict';

const { Op } = require('sequelize');

/**
 * Offset-based Pagination (yang sudah ada di helpers.js)
 * Gunakan untuk data kecil-menengah, atau saat butuh "lompat ke halaman".
 *
 * @param {{ page?: string, pageSize?: string }} query
 * @param {number} defaultSize
 * @returns {{ page, limit, offset }}
 */
const offsetPagination = (query, defaultSize = 10) => {
  const page   = Math.max(1, parseInt(query.page,     10) || 1);
  const limit  = Math.max(1, Math.min(100, parseInt(query.pageSize, 10) || defaultSize));
  const offset = (page - 1) * limit;
  return { page, limit, offset };
};

/**
 * Cursor-based Pagination
 * Lebih efisien untuk dataset besar. Tidak ada "page drift" saat data berubah.
 * Menggunakan ID sebagai cursor (bisa diganti field lain).
 *
 * @param {{ cursor?: string, limit?: string }} query
 * @param {number} defaultLimit
 * @returns {{ where: object, limit: number, order: array }}
 *
 * Cara pakai di controller:
 *
 *   const { where: cursorWhere, limit, order } = cursorPagination(req.query);
 *
 *   const rows = await Model.findAll({
 *     where: { ...yourWhere, ...cursorWhere },
 *     limit: limit + 1,  // ambil 1 lebih untuk cek hasNextPage
 *     order,
 *   });
 *
 *   const hasNextPage = rows.length > limit;
 *   const data        = hasNextPage ? rows.slice(0, limit) : rows;
 *   const nextCursor  = hasNextPage ? encodeCursor(data[data.length - 1].id) : null;
 *
 *   return res.json({
 *     data,
 *     pagination: { hasNextPage, nextCursor, limit },
 *   });
 */
const cursorPagination = (query, defaultLimit = 20) => {
  const limit  = Math.max(1, Math.min(100, parseInt(query.limit, 10) || defaultLimit));
  const cursor = query.cursor ? decodeCursor(query.cursor) : null;

  const where = cursor ? { id: { [Op.lt]: cursor } } : {};
  const order = [['id', 'DESC']];

  return { where, limit, order };
};

/**
 * Encode cursor ID ke base64 (aman untuk URL)
 * @param {number} id
 * @returns {string}
 */
const encodeCursor = (id) => Buffer.from(String(id)).toString('base64url');

/**
 * Decode base64 cursor ke number
 * @param {string} cursor
 * @returns {number|null}
 */
const decodeCursor = (cursor) => {
  try {
    const decoded = Buffer.from(cursor, 'base64url').toString('utf8');
    const id = parseInt(decoded, 10);
    return isNaN(id) ? null : id;
  } catch {
    return null;
  }
};

/**
 * Format response cursor pagination (gunakan setelah query)
 *
 * @param {object[]} rows     - Hasil query (ambil limit+1 row)
 * @param {number}   limit    - Limit yang diminta
 * @returns {{ data, pagination }}
 */
const buildCursorResponse = (rows, limit) => {
  const hasNextPage = rows.length > limit;
  const data        = hasNextPage ? rows.slice(0, limit) : rows;
  const nextCursor  = hasNextPage ? encodeCursor(data[data.length - 1].id) : null;

  return {
    data,
    pagination: {
      hasNextPage,
      nextCursor,
      limit,
    },
  };
};

module.exports = { offsetPagination, cursorPagination, encodeCursor, decodeCursor, buildCursorResponse };
