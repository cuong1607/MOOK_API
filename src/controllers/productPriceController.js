const db = require('../models');
const {
  product,
  category,
  product_color,
  product_image,
  product_size,
  price_group,
  storage,
  storage_transaction,
  product_price,
  branch,
  color,
} = db;
const { config, apiCode, IS_ACTIVE, STORAGE_TYPE, STORAGE_CHANGE_TYPE } = require('@utils/constant');
const Joi = require('joi');
const { Op } = require('sequelize');
const sequelize = require('@config/database');
const utils = require('@utils/util');
async function getAllProduct(req, res) {
  const { auth } = req;
  const { page = 1, limit = config.PAGING_LIMIT, offset = 0 } = req.query;
  const schema = Joi.object()
    .keys({
      product_id: Joi.number().required(),
    })
    .unknown(true);
  const whereCondition = { is_active: IS_ACTIVE.ACTIVE, [Op.and]: [] };

  const { product_id } = await schema.validateAsync(req.query);
  if (product_id) {
    whereCondition.product_id = product_id;
  }

  const count = await product_price.count({ where: whereCondition });
  const { rows } = await product_price.findAndCountAll({
    include: { model: color },
    where: whereCondition,
    limit,
    offset,
    order: [['id', 'DESC']],
  });
  return { data: rows, paging: { page, count: count, limit } };
}

async function createProduct(req, res) {
  const schema = Joi.object()
    .keys({
      product_id: Joi.number().empty('').required(),
      color_id: Joi.number().empty('').required(),
      price: Joi.number().empty('').required(),
      amount: Joi.number().empty('').required(),
      discount: Joi.number().empty(''),
    })
    .unknown(true);
  const { product_id, color_id, price, amount, discount } = await schema.validateAsync(req.body);
  const result = await sequelize.transaction(async (transaction) => {
    const productCreated = await product_price.create(
      {
        product_id,
        color_id,
        price,
        amount,
        discount,
      },
      { transaction },
    );
    const stroageCreated = await storage.create(
      {
        product_price_id: productCreated.id,
        stock: amount,
        receipt: amount,
        issue: 0,
      },
      { transaction },
    );
    await storage_transaction.create({
      storage_id: stroageCreated.id,
      type: STORAGE_TYPE.ADD,
      storage_change_type_id: STORAGE_CHANGE_TYPE.CREATE_STORAGE,
      amount: amount,
      stock: amount,
    });

    return productCreated;
  });

  return result;
}
async function updateProduct(req, res) {
  const schema = Joi.object()
    .keys({
      product_id: Joi.number().empty('').required(),
      color_id: Joi.number().empty('').required(),
      price: Joi.number().empty('').required(),
      amount: Joi.number().empty('').required(),
      discount: Joi.number().empty(''),
    })
    .unknown(true);
  const { product_id, color_id, price, amount, discount } = await schema.validateAsync(req.body);
  const { id } = req.params;
  const foundProduct = await product_price.findOne({
    where: { id },
  });
  if (!foundProduct) {
    throw apiCode.NOT_FOUND;
  }

  const foundStorage = await storage.findOne({
    where: {
      product_price_id: id,
      is_active: IS_ACTIVE.ACTIVE,
    },
  });
  if (!foundStorage) {
    throw new Error('Sản phẩm ko tồn tại trong kho');
  }
  const preAmount = Number(foundStorage.stock);
  let type = STORAGE_TYPE.ADD;
  let receipt = Number(foundStorage.receipt);
  let issue = Number(foundStorage.issue);
  let value = 0;
  if (amount < preAmount) {
    type = STORAGE_TYPE.SUB;
    issue = issue + Number(preAmount) - Number(amount);
    value = Number(preAmount) - Number(amount);
  } else {
    type = STORAGE_TYPE.ADD;
    receipt = receipt + Number(amount) - Number(preAmount);
    value = Number(amount) - Number(preAmount);
  }
  await sequelize.transaction(async (transaction) => {
    await foundProduct.update(
      {
        product_id,
        color_id,
        price,
        amount,
        discount,
      },
      { transaction },
    );

    foundStorage.update(
      {
        stock: amount,
        receipt,
        issue,
      },
      { transaction },
    );
    await storage_transaction.create(
      {
        storage_id: foundStorage.id,
        type,
        storage_change_type_id: STORAGE_CHANGE_TYPE.UPDATE_STORAGE,
        amount: value,
        stock: amount,
      },
      { transaction },
    );
  });
  await foundProduct.reload();
  return foundProduct;
}

async function deleteProduct(req, res) {
  const { id } = req.params;
  const foundProduct = await product_price.findOne({
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
};
