const db = require('../models');
const { user } = db;
const { config, ROLE, apiCode, IS_ACTIVE } = require('@utils/constant');
const Joi = require('joi');
const bcrypt = require('bcrypt');
const { Op } = require('sequelize');
const utils = require('@utils/util');
const sequelize = require('@config/database');

async function getAllUser(req, res) {
  const { auth } = req;
  const { page = 1, limit = config.PAGING_LIMIT, offset = 0, search } = req.query;
  const { rows, count } = await user.findAndCountAll({
    where: { is_active: IS_ACTIVE.ACTIVE, id: { [Op.ne]: auth.id } },
    attributes: {
      include: [[sequelize.literal(`IF(LENGTH(avatar) > 0,CONCAT ('${utils.getUrl()}',avatar), avatar)`), 'avatar']],
    },
    limit,
    offset,
    order: [['id', 'DESC']],
  });
  return { data: rows, paging: { page, count, limit } };
}

async function getDetailUser(req, res) {
  const { id } = req.params;
  const whereCondition = { is_active: IS_ACTIVE.ACTIVE, id };

  const detail = await user.findOne({
    where: whereCondition,
    attributes: {
      include: [[sequelize.literal(`IF(LENGTH(avatar) > 0,CONCAT ('${utils.getUrl()}',avatar), avatar)`), 'avatar']],
    },
  });
  if (!detail) {
    throw apiCode.NOT_FOUND;
  }
  return detail;
}

async function createUser(req, res) {
  const schema = Joi.object()
    .keys({
      full_name: Joi.string().empty('').required(),
      phone: Joi.string().empty('').required(),
      email: Joi.string().email().optional(),
      password: Joi.string().empty('').required(),
      avatar: Joi.string().empty(''),
    })
    .unknown(true);
  const { full_name, phone, email, password, avatar } = await schema.validateAsync(req.body);

  const foundUser = await user.findOne({
    where: { phone, is_active: IS_ACTIVE.ACTIVE },
  });
  if (foundUser) {
    throw apiCode.PHONE_EXIST;
  }
  const hash = bcrypt.hashSync(password, config.CRYPT_SALT);
  const userCreated = await user.create({
    full_name,
    phone,
    email,
    password: hash,
    role_id: ROLE.USER,
    avatar,
  });
  return userCreated;
}
async function updateUser(req, res) {
  const schema = Joi.object()
    .keys({
      full_name: Joi.string().empty('').required(),
      phone: Joi.string().empty('').required(),
      email: Joi.string().email().optional(),
      password: Joi.string().empty(''),
      avatar: Joi.string().empty(''),
    })
    .unknown(true);
  const { full_name, phone, email, password, avatar } = await schema.validateAsync(req.body);
  const { id } = req.params;
  const foundUser = await user.findOne({
    where: { id },
  });
  if (!user) {
    throw apiCode.NOT_FOUND;
  }
  let hash;
  if (password) {
    hash = bcrypt.hashSync(password, config.CRYPT_SALT);
  }
  await foundUser.update({
    full_name,
    phone,
    email,
    password: password ? hash : foundUser.password,
    updated_at: new Date(),
    avatar,
  });
  await foundUser.reload();
  return foundUser;
}

async function deleteUser(req, res) {
  const { id } = req.params;
  const foundUser = await user.findOne({
    where: { id },
  });
  if (!user) {
    throw apiCode.NOT_FOUND;
  }
  await foundUser.update({ is_active: IS_ACTIVE.INACTIVE });
  await foundUser.reload();
  return foundUser;
}
module.exports = {
  getAllUser,
  createUser,
  updateUser,
  deleteUser,
  getDetailUser,
};
