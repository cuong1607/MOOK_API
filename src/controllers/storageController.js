const db = require('../models');
const { storage, storage_transaction, product } = db;
const { config, apiCode, IS_ACTIVE, STORAGE_TYPE, STORAGE_CHANGE_TYPE } = require('@utils/constant');
const Joi = require('joi');
const { Op } = require('sequelize');
const sequelize = require('@config/database');

async function getAllStorage(req, res) {
  const { auth } = req;
  const { page = 1, limit = config.PAGING_LIMIT, offset = 0 } = req.query;
  const whereCondition = { is_active: IS_ACTIVE.ACTIVE };
  const { rows, count } = await storage.findAndCountAll({
    where: whereCondition,
    include: { model: product },
    limit,
    offset,
    order: [['id', 'DESC']],
  });
  return { data: rows, paging: { page, count: count, limit } };
}

async function getDetailStorage(req, res) {
  const { id } = req.params;
  const { page = 1, limit = config.PAGING_LIMIT, offset = 0 } = req.query;
  const whereCondition = { is_active: IS_ACTIVE.ACTIVE, storage_id: id };

  const { rows, count } = await storage_transaction.findAndCountAll({
    where: whereCondition,
    limit,
    offset,
    order: [['id', 'DESC']],
  });
  return { data: rows, paging: { page, count: count, limit } };
}

async function updateStorage(req, res) {
  const schema = Joi.object()
    .keys({
      type: Joi.number().empty('').required(),
      amount: Joi.number().empty('').required(),
    })
    .unknown(true);
  const { type, amount } = await schema.validateAsync(req.body);
  const { id } = req.params;
  const foundStorage = await storage.findOne({
    where: { id },
  });
  if (!foundStorage) {
    throw apiCode.NOT_FOUND;
  }
  let stock = Number(foundStorage.stock);
  let receipt = Number(foundStorage.receipt);
  let issue = Number(foundStorage.issue);
  if (type == STORAGE_TYPE.ADD) {
    stock = stock + Number(amount);
    receipt = receipt + Number(amount);
  } else {
    stock = stock - Number(amount);
    issue = issue + Number(amount);
  }
  await sequelize.transaction(async (transaction) => {
    await foundStorage.update(
      {
        stock,
        receipt,
        issue,
        updated_at: new Date(),
      },
      { transaction },
    );
    await storage_transaction.create(
      {
        storage_id: foundStorage.id,
        type,
        storage_change_type_id: STORAGE_CHANGE_TYPE.UPDATE_STORAGE,
        amount,
        stock,
      },
      { transaction },
    );
  });

  await foundStorage.reload();
  return foundStorage;
}

module.exports = {
  getAllStorage,
  updateStorage,
  getDetailStorage,
};
