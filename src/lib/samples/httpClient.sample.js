'use strict';

/**
 * SAMPLE: HTTP Client (axios + qs + form-data)
 * ─────────────────────────────────────────────
 * axios      — HTTP request ke external API
 * qs         — serialize object ke query string
 * form-data  — kirim multipart/form-data ke external API
 *
 * Cara pakai di controller Anda:
 *   const { get, post, postForm, postJson } = require('@my_module/samples/httpClient.sample');
 */

const axios    = require('axios');
const qs       = require('qs');
const FormData = require('form-data');
const fs       = require('fs');

// ── 1. Instance axios dengan base config ─────────────────────────
const createHttpClient = (baseURL, options = {}) => {
  return axios.create({
    baseURL,
    timeout: options.timeout || 30000,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
};

// ── 2. GET dengan query string dari object ────────────────────────
/**
 * Contoh: GET https://api.example.com/users?page=1&status=active&ids[]=1&ids[]=2
 */
const get = async (baseURL, path, params = {}) => {
  const client = createHttpClient(baseURL);
  const queryString = qs.stringify(params, { arrayFormat: 'brackets' });
  const url = queryString ? `${path}?${queryString}` : path;
  const response = await client.get(url);
  return response.data;
};

// ── 3. POST JSON ──────────────────────────────────────────────────
const postJson = async (baseURL, path, body = {}, headers = {}) => {
  const client = createHttpClient(baseURL, { headers });
  const response = await client.post(path, body);
  return response.data;
};

// ── 4. POST form-urlencoded (pakai qs) ───────────────────────────
/**
 * Cocok untuk API yang menerima application/x-www-form-urlencoded
 */
const postForm = async (baseURL, path, body = {}) => {
  const client = createHttpClient(baseURL, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });
  const response = await client.post(path, qs.stringify(body));
  return response.data;
};

// ── 5. POST multipart (upload file ke external API) ───────────────
/**
 * Contoh kirim file ke API pihak ketiga
 * @param {string} baseURL
 * @param {string} path
 * @param {{ fieldName: string, filePath: string, extraFields: object }} options
 */
const postMultipart = async (baseURL, path, { fieldName, filePath, extraFields = {} }) => {
  const form = new FormData();
  form.append(fieldName, fs.createReadStream(filePath));
  Object.entries(extraFields).forEach(([key, val]) => form.append(key, val));

  const client = createHttpClient(baseURL, { headers: form.getHeaders() });
  const response = await client.post(path, form);
  return response.data;
};

// ── 6. Contoh penggunaan di controller ───────────────────────────
/**
 * Contoh integrasi di controller Anda:
 *
 * const { get, postJson } = require('@my_module/samples/httpClient.sample');
 *
 * const getExternalUser = async (req, res) => {
 *   try {
 *     const data = await get('https://jsonplaceholder.typicode.com', '/users', { _limit: 5 });
 *     return res.json({ data });
 *   } catch (error) {
 *     return res.status(500).json({ msg: error.message });
 *   }
 * };
 */

module.exports = { createHttpClient, get, postJson, postForm, postMultipart };
