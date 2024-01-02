const db = require('../models');
const { branch } = db;
const { config, ROLE, apiCode, IS_ACTIVE, AppError } = require('@utils/constant');
const Joi = require('joi');
const bcrypt = require('bcrypt');
const { Op } = require('sequelize');

async function getAllBranch(req, res) {
  const { auth } = req;
  const { page = 1, limit = config.PAGING_LIMIT, offset = 0, status } = req.query;
  const whereCondition = { is_active: IS_ACTIVE.ACTIVE };
  if (status) {
    whereCondition.status = status;
  }
  const { rows, count } = await branch.findAndCountAll({
    where: whereCondition,
    limit,
    offset,
    order: [['id', 'DESC']],
  });
  return { data: rows, paging: { page, count, limit } };
}

async function getDetailBranch(req, res) {
  const { id } = req.params;
  const whereCondition = { is_active: IS_ACTIVE.ACTIVE, id };

  const detail = await branch.findOne({
    where: whereCondition,
  });
  if (!detail) {
    throw apiCode.NOT_FOUND;
  }
  return detail;
}

async function createBranch(req, res) {
  const schema = Joi.object()
    .keys({
      name: Joi.string().empty('').required(),
      description: Joi.string().empty(''),
    })
    .unknown(true);
  const { name, description } = await schema.validateAsync(req.body);

  const found = await branch.findOne({
    where: { name, is_active: IS_ACTIVE.ACTIVE },
  });
  if (found) {
    throw new Error('Thương hiệu đã tồn tại');
  }
  const branchCreated = await branch.create({
    name,
    description,
  });
  return branchCreated;
}
async function updateBranch(req, res) {
  const schema = Joi.object()
    .keys({
      name: Joi.string().empty('').required(),
      description: Joi.string().empty(''),
      status: Joi.number().empty(''),
    })
    .unknown(true);
  const { name, description, status } = await schema.validateAsync(req.body);
  const { id } = req.params;
  const foundBranch = await branch.findOne({
    where: { id },
  });
  if (!foundBranch) {
    throw apiCode.NOT_FOUND;
  }
  const foundName = await branch.findOne({
    where: { name, id: { [Op.ne]: id } },
  });
  if (foundName) {
    throw new Error('Tên thương hiệu đã tồn tại');
  }
  await foundBranch.update({
    name,
    description,
    status,
    updated_at: new Date(),
  });
  await foundBranch.reload();
  return foundBranch;
}

async function deleteBranch(req, res) {
  const { id } = req.params;
  const foundBranch = await branch.findOne({
    where: { id },
  });
  if (!foundBranch) {
    throw apiCode.NOT_FOUND;
  }
  await foundBranch.update({ is_active: IS_ACTIVE.INACTIVE });
  await foundBranch.reload();
  return foundBranch;
}
module.exports = {
  getAllBranch,
  createBranch,
  updateBranch,
  deleteBranch,
  getDetailBranch,
};
