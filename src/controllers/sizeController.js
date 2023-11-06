const db = require('../models');
const { size } = db;
const { config, ROLE, apiCode, IS_ACTIVE, AppError } = require('@utils/constant');
const Joi = require('joi');
const bcrypt = require('bcrypt');
const { Op } = require('sequelize');

async function getAllSize(req, res) {
  const { auth } = req;
  const { page = 1, limit = config.PAGING_LIMIT, offset = 0, search } = req.query;
  const { rows, count } = await size.findAndCountAll({
    where: { is_active: IS_ACTIVE.ACTIVE },
    limit,
    offset,
    order: [['id', 'DESC']],
  });
  return { data: rows, paging: { page, count, limit } };
}

async function getDetailSize(req, res) {
  const { id } = req.params;
  const whereCondition = { is_active: IS_ACTIVE.ACTIVE, id };

  const detail = await size.findOne({
    where: whereCondition,
  });
  if (!detail) {
    throw apiCode.NOT_FOUND;
  }
  return detail;
}

async function createSize(req, res) {
  const schema = Joi.object()
    .keys({
      name: Joi.string().empty('').required(),
      description: Joi.string().empty(''),
    })
    .unknown(true);
  const { name, description } = await schema.validateAsync(req.body);

  const found = await size.findOne({
    where: { name, is_active: IS_ACTIVE.ACTIVE },
  });
  if (found) {
    throw new Error('Tên kích cỡ đã tồn tại');
  }
  const sizeCreated = await size.create({
    name,
    description,
  });
  return sizeCreated;
}
async function updateSize(req, res) {
  const schema = Joi.object()
    .keys({
      name: Joi.string().empty('').required(),
      description: Joi.string().empty(''),
    })
    .unknown(true);
  const { name, description } = await schema.validateAsync(req.body);
  const { id } = req.params;
  const foundSize = await size.findOne({
    where: { id },
  });
  if (!foundSize) {
    throw apiCode.NOT_FOUND;
  }
  const foundName = await size.findOne({
    where: { name, id: { [Op.ne]: id } },
  });
  if (foundName) {
    throw new Error('Tên kích cỡ đã tồn tại');
  }
  await foundSize.update({
    name,
    description,
    updated_at: new Date(),
  });
  await foundSize.reload();
  return foundSize;
}

async function deleteSize(req, res) {
  const { id } = req.params;
  const foundSize = await size.findOne({
    where: { id },
  });
  if (!foundSize) {
    throw apiCode.NOT_FOUND;
  }
  await foundSize.update({ is_active: IS_ACTIVE.INACTIVE });
  await foundSize.reload();
  return foundSize;
}
module.exports = {
  getAllSize,
  createSize,
  updateSize,
  deleteSize,
  getDetailSize,
};
