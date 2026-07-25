'use strict';

const ListPermissionModel = require('@/database/models/listpermisionModel');
const res_ = require('@/lib/utils/response.js');

// ── GET /listpermission ───────────────────────────────────────────
const getList = async (req, res) => {
  try {
    const list = await ListPermissionModel.findAll();
    return res_.success(res, list);
  } catch (err) {
    return res_.serverError(res, err.message);
  }
};

module.exports = { getList };
