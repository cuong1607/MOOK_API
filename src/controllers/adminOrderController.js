const db = require('../models');
const {
  product,
  order,
  order_item,
  order_state,
  user,
  product_image,
  storage,
  storage_transaction,
  address_book,
  df_province,
  df_district,
  df_ward,
  product_price,
} = db;
const {
  config,
  apiCode,
  IS_ACTIVE,
  ORDER_STATUS,
  STORAGE_TYPE,
  STORAGE_CHANGE_TYPE,
  AppError,
} = require('@utils/constant');
const Joi = require('joi');
const utils = require('@utils/util');
const sequelize = require('@config/database');

async function getAllOrder(req, res) {
  const { auth } = req;
  const { page = 1, limit = config.PAGING_LIMIT, offset = 0, search, status } = req.query;
  const whereCondition = { is_active: IS_ACTIVE.ACTIVE };
  if (status) {
    whereCondition.status = status;
  }

  const { rows, count } = await order.findAndCountAll({
    where: whereCondition,
    include: [
      {
        model: user,
        attributes: [
          'id',
          'full_name',
          'user_name',
          [sequelize.literal(`IF(LENGTH(avatar) > 0,CONCAT ('${utils.getUrl()}',avatar), avatar)`), 'avatar'],
        ],
      },
      {
        model: order_item,
        attributes: {
          include: [
            [
              sequelize.literal(`(SELECT
            name FROM product JOIN product_price ON product_price.product_id = product.id
            where product_price.id = order_items.product_price_id
            LIMIT 1
          )`),
              'product_name',
            ],
            [
              sequelize.literal(`(SELECT
            name FROM color JOIN product_price ON product_price.color_id = color.id
            where product_price.id = order_items.product_price_id
            LIMIT 1
          )`),
              'product_color',
            ],
            [
              sequelize.literal(`(SELECT
            code FROM color JOIN product_price ON product_price.color_id = color.id
            where product_price.id = order_items.product_price_id
            LIMIT 1
          )`),
              'product_color_code',
            ],
          ],
        },
      },
      {
        model: address_book,
        attributes: {
          include: [
            [
              sequelize.literal(`(SELECT df_province.name
                FROM address_book
                JOIN df_province ON address_book.df_province_id = df_province.id
                WHERE address_book.id = address_book.id
            LIMIT 1
          )`),
              'df_provinc_name',
            ],
            [
              sequelize.literal(`(SELECT df_district.name
                FROM address_book
                JOIN df_district ON address_book.df_district_id = df_district.id
                WHERE address_book.id = address_book.id
            LIMIT 1
          )`),
              'df_district_name',
            ],
            [
              sequelize.literal(`(SELECT df_ward.name
                FROM address_book
                JOIN df_ward ON address_book.df_ward_id = df_ward.id
                WHERE address_book.id = address_book.id
            LIMIT 1
          )`),
              'df_ward_name',
            ],
          ],
        },
      },
    ],
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
    include: [
      {
        model: order_item,
        attributes: {
          include: [
            [
              sequelize.literal(`(SELECT
            name FROM product JOIN product_price ON product_price.product_id = product.id
            where product_price.id = order_items.product_price_id
            LIMIT 1
          )`),
              'product_name',
            ],
            [
              sequelize.literal(`(SELECT
            name FROM color JOIN product_price ON product_price.color_id = color.id
            where product_price.id = order_items.product_price_id
            LIMIT 1
          )`),
              'product_color',
            ],
            [
              sequelize.literal(`(SELECT
            code FROM color JOIN product_price ON product_price.color_id = color.id
            where product_price.id = order_items.product_price_id
            LIMIT 1
          )`),
              'product_color_code',
            ],
          ],
        },
      },
      { model: order_state },
      {
        model: user,
        attributes: [
          'id',
          'full_name',
          'user_name',
          [sequelize.literal(`IF(LENGTH(avatar) > 0,CONCAT ('${utils.getUrl()}',avatar), avatar)`), 'avatar'],
        ],
      },
      {
        model: address_book,
        include: [{ model: df_province }, { model: df_district }, { model: df_ward }],
      },
    ],
    order: [[db.order_state, 'id', 'ASC']],
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
      user_id: Joi.number().required(),
      total_payment: Joi.number().required(),
    })
    .unknown(true);
  const { list_product, note, user_id, total_payment } = await schema.validateAsync(req.body);
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
        user_id,
        note,
        total_price: total_payment,
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
    await order_state.create(
      {
        order_id: orderCreated.id,
        status: ORDER_STATUS.PENDING,
      },
      { transaction },
    );
    return orderCreated;
  });
  return result;
}

async function denyOrder(req, res) {
  const { auth } = req;
  const { id } = req.params;
  const schema = Joi.object()
    .keys({
      note: Joi.string(),
    })
    .unknown(true);
  const { note } = await schema.validateAsync(req.body);
  const foundOrder = await order.findOne({
    where: { id },
  });
  if (!foundOrder) {
    throw apiCode.NOT_FOUND;
  }
  const result = await sequelize.transaction(async (transaction) => {
    await foundOrder.update(
      {
        status: ORDER_STATUS.DENY,
        updated_at: new Date(),
        note,
      },
      { transaction },
    );
    await order_state.create(
      {
        order_id: foundOrder.id,
        status: ORDER_STATUS.DENY,
      },
      { transaction },
    );
  });

  await foundOrder.reload();
  return foundOrder;
}

async function updateStatusOrder(req, res) {
  const { auth } = req;
  const { id } = req.params;
  const schema = Joi.object()
    .keys({
      note: Joi.string(),
      status: Joi.number().required(),
    })
    .unknown(true);
  const { note, status } = await schema.validateAsync(req.body);
  const foundOrder = await order.findOne({
    where: { id },
  });
  if (!foundOrder) {
    throw apiCode.NOT_FOUND;
  }
  const result = await sequelize.transaction(async (transaction) => {
    if (status == ORDER_STATUS.DENY) {
      const orderItems = await order_item.findAll({ where: { order_id: foundOrder.id } });
      for (let i = 0; i < orderItems.length; i++) {
        const foundStorage = await storage.findOne({ where: { product_price_id: orderItems[i].product_price_id } });
        const stock = Number(foundStorage.stock) + Number(orderItems[i].quantity);
        const issue = Number(foundStorage.issue) - Number(orderItems[i].quantity);
        await foundStorage.update(
          {
            stock,
            issue,
          },
          { transaction },
        );
        await storage_transaction.create(
          {
            storage_id: foundStorage.id,
            type: STORAGE_TYPE.ADD,
            storage_change_type_id: STORAGE_CHANGE_TYPE.REFUND_ORDER,
            amount: Number(orderItems[i].quantity),
            stock,
          },
          { transaction },
        );
        await product_price.update(
          {
            amount: stock,
          },
          {
            where: {
              id: orderItems[i].product_price_id,
            },
            transaction,
          },
        );
      }
    }
    await foundOrder.update(
      {
        status,
        updated_at: new Date(),
        note,
      },
      { transaction },
    );
    await order_state.create(
      {
        order_id: foundOrder.id,
        status,
      },
      { transaction },
    );
  });

  await foundOrder.reload();
  return foundOrder;
}
module.exports = {
  createOrder,
  getAllOrder,
  getDetailOrder,
  denyOrder,
  updateStatusOrder,
};
