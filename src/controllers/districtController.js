const db = require('../models');
const { df_district } = db;
const { config, ROLE, apiCode, IS_ACTIVE, AppError } = require('@utils/constant');
const Joi = require('joi');
const bcrypt = require('bcrypt');
const { Op } = require('sequelize');

async function getAllDistrict(req, res) {
  const { page = 1, limit = config.PAGING_LIMIT, offset = 0, df_province_id, search } = req.query;
  let district = [];
  let whereCondition = {};
  if (df_province_id) {
    whereCondition = {
      ...whereCondition,
      df_province_id,
    };
    if (search) {
      whereCondition = {
        ...whereCondition,
        name: {
          [Op.like]: `%${search}%`,
        },
      };
    }
    const { rows, count } = await df_district.findAndCountAll({
      where: whereCondition,
      limit,
      offset,
      order: [['id', 'DESC']],
    });
    district = rows;
  }

  return { data: district };
}
module.exports = {
  getAllDistrict,
};
