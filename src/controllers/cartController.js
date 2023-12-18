const db = require('../models');
const { product, order, order_item, order_state, cart_item, product_price, color } = db;
const { config, apiCode, IS_ACTIVE, ORDER_STATUS } = require('@utils/constant');
const Joi = require('joi');
const utils = require('@utils/util');
const sequelize = require('@config/database');

async function getAllCart(req, res) {
  const { auth } = req;
  const { page = 1, limit = config.PAGING_LIMIT, offset = 0, search, status } = req.query;
  const whereCondition = { is_active: IS_ACTIVE.ACTIVE, user_id: auth.id };
  if (status) {
    whereCondition.status = status;
  }

  const { rows, count } = await cart_item.findAndCountAll({
    where: whereCondition,
    include: { model: product_price, include: { model: color } },
    attributes: {
      include: [
        [
          sequelize.literal(`(SELECT
        name FROM product JOIN product_price ON product_price.product_id = product.id
        WHERE product_price.id = cart_item.product_price_id
        LIMIT 1
      )`),
          'product_name',
        ],
      ],
    },
    limit,
    offset,
  });
  return { data: rows, paging: { page, count, limit } };
}

async function getDetailCart(req, res) {
  const { id } = req.params;
  const whereCondition = { is_active: IS_ACTIVE.ACTIVE, id };

  const detail = await cart_item.findOne({
    where: whereCondition,
    include: { model: product_price, include: { model: color } },
    attributes: {
      include: [
        [
          sequelize.literal(`(SELECT
        name FROM product JOIN product_price ON product_price.product_id = product.id
        WHERE product_price.id = cart_item.product_price_id
        LIMIT 1
      )`),
          'product_name',
        ],
      ],
    },
  });
  if (!detail) {
    throw apiCode.NOT_FOUND;
  }
  return detail;
}

async function createCart(req, res) {
  const { auth } = req;
  const schema = Joi.object()
    .keys({
      product_price_id: Joi.number().empty(''),
    })
    .unknown(true);
  const { product_price_id } = await schema.validateAsync(req.body);
  const result = await sequelize.transaction(async (transaction) => {
    const cartCreated = await cart_item.create(
      {
        user_id: auth.id,
        product_price_id,
        quantity: 1,
      },
      { transaction },
    );
    return cartCreated;
  });
  return result;
}
async function deleteCart(req, res) {
  const { auth } = req;
  const { id } = req.params;
  const foundCart = await cart_item.findOne({
    where: { id },
  });
  if (!foundCart) {
    throw apiCode.NOT_FOUND;
  }
  if (foundCart.user_id != auth.id) {
    throw new Error('Giỏ hàng không phải của bạn');
  }
  const result = await sequelize.transaction(async (transaction) => {
    await foundCart.update(
      {
        is_active: IS_ACTIVE.INACTIVE,
        updated_at: new Date(),
      },
      { transaction },
    );
  });

  await foundCart.reload();
  return foundCart;
}

async function updateCart(req, res) {
  const { auth } = req;
  const { id } = req.params;
  const schema = Joi.object()
    .keys({
      quantity: Joi.number().empty(''),
    })
    .unknown(true);
  const { quantity } = await schema.validateAsync(req.body);
  const foundCart = await cart_item.findOne({
    where: { id },
  });
  if (!foundCart) {
    throw apiCode.NOT_FOUND;
  }
  if (foundCart.user_id != auth.id) {
    throw new Error('Giỏ hàng không phải của bạn');
  }
  const result = await sequelize.transaction(async (transaction) => {
    await foundCart.update(
      {
        quantity,
        updated_at: new Date(),
      },
      { transaction },
    );
  });

  await foundCart.reload();
  return foundCart;
}

module.exports = {
  createCart,
  getAllCart,
  getDetailCart,
  deleteCart,
  updateCart,
};
