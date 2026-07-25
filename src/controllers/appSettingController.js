'use strict';

const AppSetting = require('@/database/models/appSettingModel.js');
const { getAll, get, invalidate } = require('@/lib/services/appSettingService.js');
const res_ = require('@/lib/utils/response.js');

// ── GET /settings (admin — semua setting) ─────────────────────────
const getSettings = async (req, res) => {
  try {
    const rows = await AppSetting.findAll({ order: [['group', 'ASC'], ['key', 'ASC']] });
    return res_.success(res, rows);
  } catch (err) {
    return res_.serverError(res, err.message);
  }
};

// ── GET /settings/public (tanpa auth — hanya isPublic=true) ───────
const getPublicSettings = async (req, res) => {
  try {
    const rows = await AppSetting.findAll({
      where: { isPublic: true },
      attributes: ['key', 'value', 'type', 'label'],
    });
    const result = {};
    rows.forEach(r => {
      let val = r.value;
      if (r.type === 'number')  val = Number(val);
      if (r.type === 'boolean') val = val === 'true';
      if (r.type === 'json')    try { val = JSON.parse(val); } catch {}
      result[r.key] = val;
    });
    return res_.success(res, result);
  } catch (err) {
    return res_.serverError(res, err.message);
  }
};

// ── PUT /settings/:key ────────────────────────────────────────────
const updateSetting = async (req, res) => {
  try {
    const { key } = req.params;
    const { value } = req.body;

    const setting = await AppSetting.findOne({ where: { key } });
    if (!setting) return res_.notFound(res, `Setting '${key}' tidak ditemukan`);

    await setting.update({ value: String(value) });
    await invalidate();

    return res_.success(res, setting, `Setting '${key}' berhasil diperbarui`);
  } catch (err) {
    return res_.serverError(res, err.message);
  }
};

// ── POST /settings (buat setting baru) ───────────────────────────
const createSetting = async (req, res) => {
  try {
    const { key, value, type, group, label, description, isPublic } = req.body;

    const existing = await AppSetting.findOne({ where: { key } });
    if (existing) return res_.badRequest(res, `Setting dengan key '${key}' sudah ada`);

    const setting = await AppSetting.create({
      key, value: value !== undefined ? String(value) : null,
      type:    type    || 'string',
      group:   group   || 'general',
      label:   label   || key,
      description: description || null,
      isPublic: Boolean(isPublic),
    });

    await invalidate();
    return res_.created(res, setting, 'Setting berhasil dibuat');
  } catch (err) {
    return res_.serverError(res, err.message);
  }
};

// ── DELETE /settings/:key ─────────────────────────────────────────
const deleteSetting = async (req, res) => {
  try {
    const setting = await AppSetting.findOne({ where: { key: req.params.key } });
    if (!setting) return res_.notFound(res, `Setting '${req.params.key}' tidak ditemukan`);
    await setting.destroy();
    await invalidate();
    return res_.success(res, null, `Setting '${req.params.key}' berhasil dihapus`);
  } catch (err) {
    return res_.serverError(res, err.message);
  }
};

module.exports = { getSettings, getPublicSettings, updateSetting, createSetting, deleteSetting };
