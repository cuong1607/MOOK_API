const db = require('../models');
const { product, category } = db;
const { config, apiCode, IS_ACTIVE } = require('@utils/constant');
const Joi = require('joi');
const bcrypt = require('bcrypt');
const { Op } = require('sequelize');

async function getAllProduct(req, res) {
  const { auth } = req;
  const { page = 1, limit = config.PAGING_LIMIT, offset = 0, search } = req.query;
  const schema = Joi.object()
    .keys({
      category_id: Joi.number().empty(''),
    })
    .unknown(true);
  const whereCondition = { is_active: IS_ACTIVE.ACTIVE };

  const { category_id } = await schema.validateAsync(req.query);
  if (category_id) {
    whereCondition.category_id = category_id;
  }
  const { rows, count } = await product.findAndCountAll({
    where: whereCondition,
    limit,
    offset,
    order: [['id', 'DESC']],
  });
  return { data: rows, paging: { page, count, limit } };
}

async function getDetailProduct(req, res) {
  const { id } = req.params;
  const whereCondition = { is_active: IS_ACTIVE.ACTIVE, id };

  const detail = await product.findOne({
    where: whereCondition,
    include: { model: category },
  });
  return detail;
}

async function createProduct(req, res) {
  const schema = Joi.object()
    .keys({
      category_id: Joi.number().empty('').required(),
      name: Joi.string().empty('').required(),
      code: Joi.string().empty('').required(),
      price: Joi.number().empty('').required(),
      description: Joi.string(),
    })
    .unknown(true);
  const { category_id, name, code, price, description } = await schema.validateAsync(req.body);

  const found = await product.findOne({
    where: { code, is_active: IS_ACTIVE.ACTIVE },
  });
  if (found) {
    throw new Error('Mã code sản phẩm đã tồn tại');
  }
  const productCreated = await product.create({
    name,
    code,
    category_id,
    price,
    description,
  });
  return productCreated;
}
async function updateProduct(req, res) {
  const schema = Joi.object()
    .keys({
      category_id: Joi.number().empty('').required(),
      name: Joi.string().empty('').required(),
      code: Joi.string().empty('').required(),
      price: Joi.number().empty('').required(),
      description: Joi.string(),
      status: Joi.number().empty('').required(),
    })
    .unknown(true);
  const { category_id, name, code, price, description, status } = await schema.validateAsync(req.body);
  const { id } = req.params;
  const foundProduct = await product.findOne({
    where: { id },
  });
  if (!foundProduct) {
    throw apiCode.NOT_FOUND;
  }
  const foundCode = await product.findOne({
    where: { code, id: { [Op.ne]: id } },
  });
  if (foundCode) {
    throw new Error('Mã sản phẩm đã tồn tại');
  }
  await foundProduct.update({
    category_id,
    name,
    code,
    price,
    description,
    status,
    updated_at: new Date(),
  });
  await foundProduct.reload();
  return foundProduct;
}

async function deleteProduct(req, res) {
  const { id } = req.params;
  const foundProduct = await product.findOne({
    where: { id },
  });
  if (!foundProduct) {
    throw apiCode.NOT_FOUND;
  }
  await foundProduct.update({ is_active: IS_ACTIVE.INACTIVE });
  await foundProduct.reload();
  return foundProduct;
}
module.exports = {
  getAllProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getDetailProduct,
};
