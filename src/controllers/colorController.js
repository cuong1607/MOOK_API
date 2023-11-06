const db = require('../models');
const { color } = db;
const { config, ROLE, apiCode, IS_ACTIVE, AppError } = require('@utils/constant');
const Joi = require('joi');
const bcrypt = require('bcrypt');
const { Op } = require('sequelize');

async function getAllColor(req, res) {
  const { auth } = req;
  const { page = 1, limit = config.PAGING_LIMIT, offset = 0, search } = req.query;
  const { rows, count } = await color.findAndCountAll({
    where: { is_active: IS_ACTIVE.ACTIVE },
    limit,
    offset,
    order: [['id', 'DESC']],
  });
  return { data: rows, paging: { page, count, limit } };
}

async function getDetailColor(req, res) {
  const { id } = req.params;
  const whereCondition = { is_active: IS_ACTIVE.ACTIVE, id };

  const detail = await color.findOne({
    where: whereCondition,
  });
  if (!detail) {
    throw apiCode.NOT_FOUND;
  }
  return detail;
}

async function createColor(req, res) {
  const schema = Joi.object()
    .keys({
      name: Joi.string().empty('').required(),
      code: Joi.string().empty('').required(),
      description: Joi.string().empty(''),
    })
    .unknown(true);
  const { name, description, code } = await schema.validateAsync(req.body);

  const found = await color.findOne({
    where: { code, is_active: IS_ACTIVE.ACTIVE },
  });
  if (found) {
    throw new Error('Mã màu đã tồn tại');
  }
  const colorCreated = await color.create({
    name,
    code,
    description,
  });
  return colorCreated;
}
async function updateColor(req, res) {
  const schema = Joi.object()
    .keys({
      name: Joi.string().empty('').required(),
      code: Joi.string().empty('').required(),
      description: Joi.string().empty(''),
    })
    .unknown(true);
  const { name, description, code } = await schema.validateAsync(req.body);
  const { id } = req.params;
  const foundColor = await color.findOne({
    where: { id },
  });
  if (!foundColor) {
    throw apiCode.NOT_FOUND;
  }
  const foundCode = await color.findOne({
    where: { name, id: { [Op.ne]: id } },
  });
  if (foundCode) {
    throw new Error('Mã code đã tồn tại');
  }
  await foundColor.update({
    name,
    code,
    description,
    updated_at: new Date(),
  });
  await foundColor.reload();
  return foundColor;
}

async function deleteColor(req, res) {
  const { id } = req.params;
  const foundColor = await color.findOne({
    where: { id },
  });
  if (!foundColor) {
    throw apiCode.NOT_FOUND;
  }
  await foundColor.update({ is_active: IS_ACTIVE.INACTIVE });
  await foundColor.reload();
  return foundColor;
}
module.exports = {
  getAllColor,
  createColor,
  updateColor,
  deleteColor,
  getDetailColor,
};
