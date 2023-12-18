const db = require('../models');
const { df_province } = db;
const { config, ROLE, apiCode, IS_ACTIVE, AppError } = require('@utils/constant');
const Joi = require('joi');
const bcrypt = require('bcrypt');
const { Op } = require('sequelize');

async function getAllProvince(req, res) {
  const { auth } = req;
  const { page = 1, limit = config.PAGING_LIMIT, offset = 0, search } = req.query;
  const whereCondition = {};
  if (search) {
    whereCondition.name = {
      [Op.like]: `%${search}%`,
    };
  }
  const { rows, count } = await df_province.findAndCountAll({
    where: whereCondition,
    order: [['id', 'DESC']],
  });
  return { data: rows };
}
module.exports = {
  getAllProvince,
};
