const { use } = require('@src/routes');
const db = require('../models');
const { user } = db;
const { config, ROLE, apiCode, IS_ACTIVE, AppError } = require('@utils/constant');
const Joi = require('joi');
const bcrypt = require('bcrypt');

async function login(req, res) {
  const schema = Joi.object()
    .keys({
      phone: Joi.string().empty('').required(),
      password: Joi.string().empty('').required(),
    })
    .unknown(true);
  const { phone, password } = await schema.validateAsync(req.body);
  const findUser = await user.findOne({
    where: { phone },
  });
  if (!findUser) {
    throw apiCode.LOGIN_FAIL;
  }
  const comparePassword = await bcrypt.compare(password, findUser.password);
  if (!comparePassword) {
    throw apiCode.PASSWORD_FAIL;
  }
  const token = findUser.generateToken();
  await findUser.update({ token });
  await findUser.reload();
  return findUser;
}

async function register(req, res) {
  const schema = Joi.object()
    .keys({
      full_name: Joi.string().empty('').required(),
      phone: Joi.string().empty('').required(),
      email: Joi.string().email().optional(),
      password: Joi.string().empty('').required(),
    })
    .unknown(true);
  const { full_name, phone, email, password } = await schema.validateAsync(req.body);
  const foundUser = await user.findOne({
    where: { phone, is_active: IS_ACTIVE.ACTIVE },
  });
  if (foundUser) {
    throw apiCode.PHONE_EXIST;
  }
  const hash = bcrypt.hashSync(password, config.CRYPT_SALT);
  console.log({ full_name, phone, email, password });
  const userCreated = await user.create({
    full_name,
    phone,
    email,
    password: hash,
    role_id: ROLE.USER,
  });
  return userCreated;
}

async function logout(req, res) {
  const { auth } = req;
  const foundUser = await user.findOne({
    where: { id: auth.id },
    logging: console.log,
  });

  if (!user) throw new AppError(apiCode.NOT_FOUND);
  await foundUser.update({ token: null });
}

async function getInfor(req, res) {
  const { auth } = req;
  const foundUser = await user.findOne({
    where: { id: auth.id },
  });

  if (!user) throw new AppError(apiCode.NOT_FOUND);
  return foundUser;
}
module.exports = {
  login,
  register,
  logout,
  getInfor,
};
