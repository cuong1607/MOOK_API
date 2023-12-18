const db = require('../models');
const { df_ward } = db;
const { config, ROLE, apiCode, IS_ACTIVE, AppError } = require('@utils/constant');
const Joi = require('joi');
const bcrypt = require('bcrypt');
const { Op } = require('sequelize');

async function getAllWard(req, res) {
  const { page = 1, limit = config.PAGING_LIMIT, offset = 0, df_district_id, search } = req.query;
  let ward = [];
  let whereCondition = {};
  if (df_district_id) {
    whereCondition = {
      ...whereCondition,
      df_district_id,
    };
    if (search) {
      whereCondition = {
        ...whereCondition,
        name: {
          [Op.like]: `%${search}%`,
        },
      };
    }
    const { rows, count } = await df_ward.findAndCountAll({
      where: whereCondition,
      limit,
      offset,
      order: [['id', 'DESC']],
    });
    ward = rows;
  }

  return { data: ward };
}
module.exports = {
  getAllWard,
};
