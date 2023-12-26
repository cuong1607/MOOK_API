const db = require('../models');
const { order, user } = db;
const { config, ROLE, apiCode, IS_ACTIVE, AppError, ORDER_STATUS } = require('@utils/constant');
const Joi = require('joi');
const bcrypt = require('bcrypt');
const { Op } = require('sequelize');
const utils = require('@utils/util');
const sequelize = require('@config/database');

async function getAllOverview(req, res) {
  const { auth } = req;
  const { page = 1, limit = config.PAGING_LIMIT, offset = 0, search } = req.query;
  let { from_date, to_date } = req.query;
  if (!from_date) from_date = 0;
  if (!to_date) to_date = new Date(Date.now());
  const performDate = await utils.convertDateToUTC(from_date, to_date);
  const orderCount = await order.count({
    where: {
      is_active: IS_ACTIVE.ACTIVE,
      created_at: { [Op.and]: [{ [Op.lte]: performDate.toDate }, { [Op.gte]: performDate.fromDate }] },
    },
  });
  const totalOrder = await order.sum('total_price', {
    where: {
      status: { [Op.notIn]: [ORDER_STATUS.CANCELED, ORDER_STATUS.DENY] },
      created_at: { [Op.and]: [{ [Op.lte]: performDate.toDate }, { [Op.gte]: performDate.fromDate }] },
    },
  });
  const { rows, count } = await user.findAndCountAll({
    where: { is_active: IS_ACTIVE.ACTIVE, role_id: ROLE.USER },
    attributes: [
      'id',
      'full_name',
      'phone',
      'email',
      [sequelize.literal(`IF(LENGTH(avatar) > 0,CONCAT ('${utils.getUrl()}',avatar), avatar)`), 'avatar'],
    ],
    limit,
    offset,
    order: [['id', 'DESC']],
  });
  for (let index = 0; index < rows.length; index++) {
    const orderCount = await order.count({
      where: {
        is_active: IS_ACTIVE.ACTIVE,
        created_at: { [Op.and]: [{ [Op.lte]: performDate.toDate }, { [Op.gte]: performDate.fromDate }] },
        user_id: rows[index].id,
      },
    });
    const totalOrder = await order.sum('total_price', {
      where: {
        status: { [Op.notIn]: [ORDER_STATUS.CANCELED, ORDER_STATUS.DENY] },
        created_at: { [Op.and]: [{ [Op.lte]: performDate.toDate }, { [Op.gte]: performDate.fromDate }] },
        user_id: rows[index].id,
      },
    });
    rows[index].dataValues.order_count = orderCount | 0;
    rows[index].dataValues.order_total = totalOrder | 0;
  }
  return {
    data: { total_order: totalOrder || 0, order_count: orderCount || 0, users: rows },
    paging: { page, count: count, limit },
  };
}

module.exports = {
  getAllOverview,
};
