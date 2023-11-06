const db = require('../models');
const { price_group } = db;
const { config, apiCode, IS_ACTIVE } = require('@utils/constant');
const Joi = require('joi');

async function getAllPrice(req, res) {
  const { auth } = req;
  const { page = 1, limit = config.PAGING_LIMIT, offset = 0 } = req.query;
  const { rows, count } = await price_group.findAndCountAll({
    where: { is_active: IS_ACTIVE.ACTIVE },
    limit,
    offset,
    order: [['id', 'DESC']],
  });
  return { data: rows, paging: { page, count, limit } };
}

async function getDetailPrice(req, res) {
  const { id } = req.params;
  const whereCondition = { is_active: IS_ACTIVE.ACTIVE, id };

  const detail = await price_group.findOne({
    where: whereCondition,
  });
  if (!detail) {
    throw apiCode.NOT_FOUND;
  }
  return detail;
}

async function createPrice(req, res) {
  const schema = Joi.object()
    .keys({
      min_price: Joi.number().empty('').required(),
      max_price: Joi.number().empty('').required(),
      description: Joi.string().empty(''),
    })
    .unknown(true);
  const { min_price, description, max_price } = await schema.validateAsync(req.body);

  const priceCreated = await price_group.create({
    min_price,
    max_price,
    description,
  });
  return priceCreated;
}
async function updatePrice(req, res) {
  const schema = Joi.object()
    .keys({
      min_price: Joi.number().empty('').required(),
      max_price: Joi.number().empty('').required(),
      description: Joi.string().empty(''),
    })
    .unknown(true);
  const { min_price, description, max_price } = await schema.validateAsync(req.body);
  const { id } = req.params;
  const foundPrice = await price_group.findOne({
    where: { id },
  });
  if (!foundPrice) {
    throw apiCode.NOT_FOUND;
  }
  await foundPrice.update({
    min_price,
    description,
    max_price,
    updated_at: new Date(),
  });
  await foundPrice.reload();
  return foundPrice;
}

async function deletePrice(req, res) {
  const { id } = req.params;
  const foundPrice = await price_group.findOne({
    where: { id },
  });
  if (!foundPrice) {
    throw apiCode.NOT_FOUND;
  }
  await foundPrice.update({ is_active: IS_ACTIVE.INACTIVE });
  await foundPrice.reload();
  return foundPrice;
}
module.exports = {
  getAllPrice,
  createPrice,
  updatePrice,
  deletePrice,
  getDetailPrice,
};
