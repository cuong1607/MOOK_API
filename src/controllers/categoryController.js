const db = require('../models');
const { category } = db;
const { config, ROLE, apiCode, IS_ACTIVE, AppError } = require('@utils/constant');
const Joi = require('joi');
const bcrypt = require('bcrypt');
const { Op } = require('sequelize');

async function getAllcategory(req, res) {
  const { auth } = req;
  const { page = 1, limit = config.PAGING_LIMIT, offset = 0, search, status } = req.query;
  const whereCondition = { is_active: IS_ACTIVE.ACTIVE };
  if (status) {
    whereCondition.status = status;
  }
  if (search) {
    whereCondition.name = { [Op.substring]: search };
  }
  const { rows, count } = await category.findAndCountAll({
    where: whereCondition,
    limit,
    offset,
    order: [['id', 'DESC']],
  });
  return { data: rows, paging: { page, count, limit } };
}

async function getDetailCategory(req, res) {
  const { id } = req.params;
  const whereCondition = { is_active: IS_ACTIVE.ACTIVE, id };

  const detail = await category.findOne({
    where: whereCondition,
  });
  if (!detail) {
    throw apiCode.NOT_FOUND;
  }
  return detail;
}

async function createCategory(req, res) {
  const schema = Joi.object()
    .keys({
      name: Joi.string().empty('').required(),
      code: Joi.string().empty('').required(),
    })
    .unknown(true);
  const { name, code } = await schema.validateAsync(req.body);

  const found = await category.findOne({
    where: { code, is_active: IS_ACTIVE.ACTIVE },
  });
  if (found) {
    throw new Error('Mã code danh mục đã tồn tại');
  }
  const categoryCreated = await category.create({
    name,
    code,
  });
  return categoryCreated;
}
async function updateCategory(req, res) {
  const schema = Joi.object()
    .keys({
      name: Joi.string().empty('').required(),
      code: Joi.string().empty('').required(),
      status: Joi.number().empty(''),
    })
    .unknown(true);
  const { name, code, status } = await schema.validateAsync(req.body);
  const { id } = req.params;
  const foundCategory = await category.findOne({
    where: { id },
  });
  if (!foundCategory) {
    throw apiCode.NOT_FOUND;
  }
  const foundCode = await category.findOne({
    where: { code, id: { [Op.ne]: id } },
  });
  if (foundCode) {
    throw new Error('Mã danh mục đã tồn tại');
  }
  await foundCategory.update({
    name,
    code,
    status,
    updated_at: new Date(),
  });
  await foundCategory.reload();
  return foundCategory;
}

async function deleteCategory(req, res) {
  const { id } = req.params;
  const foundCategory = await category.findOne({
    where: { id },
  });
  if (!foundCategory) {
    throw apiCode.NOT_FOUND;
  }
  await foundCategory.update({ is_active: IS_ACTIVE.INACTIVE });
  await foundCategory.reload();
  return foundCategory;
}
module.exports = {
  getAllcategory,
  createCategory,
  updateCategory,
  deleteCategory,
  getDetailCategory,
};
