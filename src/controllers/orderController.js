const db = require('../models');
const {
  product,
  order,
  order_item,
  order_state,
  cart_item,
  product_price,
  address_book,
  df_province,
  df_district,
  df_ward,
} = db;
const { config, apiCode, IS_ACTIVE, ORDER_STATUS } = require('@utils/constant');
const Joi = require('joi');
const utils = require('@utils/util');
const sequelize = require('@config/database');
const { Op } = require('sequelize');

async function getAllOrder(req, res) {
  const { auth } = req;
  const { page = 1, limit = config.PAGING_LIMIT, offset = 0, search, status } = req.query;
  const whereCondition = { is_active: IS_ACTIVE.ACTIVE, user_id: auth.id };
  if (status) {
    whereCondition.status = status;
  }
  const count = await order.count({
    where: whereCondition,
  });
  const { rows } = await order.findAndCountAll({
    where: whereCondition,
    include: {
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
      {
        model: address_book,
        include: [{ model: df_province }, { model: df_district }, { model: df_ward }],
      },
    ],
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
      note: Joi.string(),
      cart_items: Joi.array().empty(''),
      payment_method: Joi.number().required(),
      list_product: Joi.array().empty(''),
      name: Joi.string().required(),
      phone_number: Joi.string().required(),
      df_province_id: Joi.number().required(),
      df_district_id: Joi.number().required(),
      df_ward_id: Joi.number().required(),
      address: Joi.string().required(),
    })
    .unknown(true);
  const {
    note,
    cart_items,
    payment_method,
    name,
    phone_number,
    df_province_id,
    df_district_id,
    df_ward_id,
    address,
    list_product,
  } = await schema.validateAsync(req.body);
  const orderItemCreated = [];
  let total_payment = 0;
  let result;
  if (cart_items && cart_items.length >= 0) {
    const foundCart = await cart_item.findAll({
      where: { id: { [Op.in]: cart_items } },
      include: {
        model: product_price,
      },
    });
    if (!foundCart) {
      throw apiCode.NOT_FOUND;
    }
    for (let i = 0; i < foundCart.length; i++) {
      const price = foundCart[i].product_price.price;
      const discount = foundCart[i].product_price.discount || 0;
      total_payment = total_payment + (Number(price) - Number(discount)) * Number(foundCart[i].quantity);
      orderItemCreated.push({
        product_price_id: foundCart[i].product_price_id,
        quantity: foundCart[i].quantity,
        price: Number(price) - Number(discount),
      });
    }
    result = await sequelize.transaction(async (transaction) => {
      await cart_item.update(
        { is_active: IS_ACTIVE.INACTIVE },
        { where: { id: { [Op.in]: cart_items } }, transaction },
      );
      const orderCreated = await order.create(
        {
          user_id: auth ? auth.id : null,
          note,
          total_price: total_payment,
          payment_method,
        },
        { transaction },
      );
      const itemCreated = orderItemCreated.map((e) => ({
        order_id: orderCreated.id,
        product_price_id: e.product_price_id,
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
      await address_book.create(
        {
          order_id: orderCreated.id,
          name: name,
          phone_number: phone_number,
          df_province_id: df_province_id,
          df_district_id: df_district_id,
          df_ward_id: df_ward_id,
          address: address,
        },
        { transaction },
      );
      return orderCreated;
    });
  } else if (list_product && list_product.length > 0) {
    let total_payment = 0;
    for (let i = 0; i < list_product.length; i++) {
      const productPrice = await product_price.findOne({
        where: {
          id: list_product[i].product_price_id,
        },
      });
      const price = productPrice.price;
      const discount = productPrice.discount || 0;
      total_payment = total_payment + (Number(price) - Number(discount)) * Number(list_product[i].quantity);
      orderItemCreated.push({
        product_price_id: list_product[i].product_price_id,
        quantity: list_product[i].quantity,
        price: Number(price) - Number(discount),
      });
    }
    result = await sequelize.transaction(async (transaction) => {
      const orderCreated = await order.create(
        {
          user_id: auth ? auth.id : null,
          note,
          total_price: total_payment,
          payment_method,
        },
        { transaction },
      );
      const itemCreated = orderItemCreated.map((e) => ({
        order_id: orderCreated.id,
        product_price_id: e.product_price_id,
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
      await address_book.create(
        {
          order_id: orderCreated.id,
          name: name,
          phone_number: phone_number,
          df_province_id: df_province_id,
          df_district_id: df_district_id,
          df_ward_id: df_ward_id,
          address: address,
        },
        { transaction },
      );
      return orderCreated;
    });
  }
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
