const db = require('../models');
const { product, order, order_item, order_state } = db;
const { config, apiCode, IS_ACTIVE, ORDER_STATUS } = require('@utils/constant');
const Joi = require('joi');
const utils = require('@utils/util');
const sequelize = require('@config/database');

async function getAllOrder(req, res) {
  const { auth } = req;
  const { page = 1, limit = config.PAGING_LIMIT, offset = 0, search, status } = req.query;
  const whereCondition = { is_active: IS_ACTIVE.ACTIVE, user_id: auth.id };
  if (status) {
    whereCondition.status = status;
  }

  const { rows, count } = await order.findAndCountAll({
    where: whereCondition,
    limit,
    offset,
    order: [['id', 'DESC']],
  });
  return { data: rows, paging: { page, count, limit } };
}

async function getDetailOrder(req, res) {
  const { id } = req.params;
  const whereCondition = { is_active: IS_ACTIVE.ACTIVE, id };

  const detail = await order.findOne({
    where: whereCondition,
    include: { model: order_item },
  });
  if (!detail) {
    throw apiCode.NOT_FOUND;
  }
  return detail;
}

async function createOrder(req, res) {
  const { auth } = req;
  const schema = Joi.object()
    .keys({
      list_product: Joi.array().empty(''),
      note: Joi.string(),
    })
    .unknown(true);
  const { list_product, note } = await schema.validateAsync(req.body);
  let total = 0;
  const orderItemCreated = [];
  for (let i = 0; i < list_product.length; i++) {
    const foundProduct = await product.findOne({
      where: { id: list_product[i].product_id },
    });
    total = Number(total) + Number(foundProduct.price) * Number(list_product[i].quantity);
    orderItemCreated.push({
      product_id: list_product[i].product_id,
      quantity: list_product[i].quantity,
      price: Number(foundProduct.price) * Number(list_product[i].quantity),
    });
  }
  const result = await sequelize.transaction(async (transaction) => {
    const orderCreated = await order.create(
      {
        user_id: auth.id,
        note,
        total_price: total,
      },
      { transaction },
    );
    const itemCreated = orderItemCreated.map((e) => ({
      order_id: orderCreated.id,
      product_id: e.product_id,
      quantity: e.quantity,
      price: e.price,
    }));
    const orderCode = utils.generateCode(orderCreated.id);
    await orderCreated.update({ code: orderCode }, { transaction });
    await order_item.bulkCreate(itemCreated, { transaction });
    await order_state.create({
      order_id: orderCreated.id,
      status: ORDER_STATUS.PENDING,
    });
    return orderCreated;
  });
  return result;
}
async function cancleOrder(req, res) {
  const { auth } = req;
  const { id } = req.params;
  const foundOrder = await order.findOne({
    where: { id },
  });
  if (!foundOrder) {
    throw apiCode.NOT_FOUND;
  }
  if (foundOrder.user_id != auth.id) {
    throw new Error('Đơn hàng không phải của bạn');
  }
  const result = await sequelize.transaction(async (transaction) => {
    await foundOrder.update(
      {
        status: ORDER_STATUS.CANCELED,
        updated_at: new Date(),
      },
      { transaction },
    );
    await order_state.create({
      order_id: foundOrder.id,
      status: ORDER_STATUS.CANCELED,
    });
  });

  await foundOrder.reload();
  return foundOrder;
}

module.exports = {
  createOrder,
  getAllOrder,
  getDetailOrder,
  cancleOrder,
};
