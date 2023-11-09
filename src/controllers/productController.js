const db = require('../models');
const { product, category, product_color, product_image, product_size } = db;
const { config, apiCode, IS_ACTIVE } = require('@utils/constant');
const Joi = require('joi');
const { Op } = require('sequelize');
const sequelize = require('@config/database');
const utils = require('@utils/util');
async function getAllProduct(req, res) {
  const { auth } = req;
  const { page = 1, limit = config.PAGING_LIMIT, offset = 0 } = req.query;
  const schema = Joi.object()
    .keys({
      category_id: Joi.number().empty(''),
    })
    .unknown(true);
  const whereCondition = { is_active: IS_ACTIVE.ACTIVE };

  const { category_id, search, size_ids } = await schema.validateAsync(req.query);
  if (category_id) {
    whereCondition.category_id = category_id;
  }
  if (search) {
    whereCondition.name = { [Op.substring]: search };
  }
  const count = await product.count({ where: whereCondition });
  const { rows } = await product.findAndCountAll({
    where: whereCondition,
    include: {
      model: product_image,
      attributes: {
        include: [[sequelize.literal(`IF(LENGTH(path) > 0,CONCAT ('${utils.getUrl()}',path), path)`), 'path']],
      },
    },
    limit,
    offset,
    order: [['id', 'DESC']],
  });
  return { data: rows, paging: { page, count: count, limit } };
}

async function getDetailProduct(req, res) {
  const { id } = req.params;
  const whereCondition = { is_active: IS_ACTIVE.ACTIVE, id };

  const detail = await product.findOne({
    where: whereCondition,
    include: [
      { model: category },
      {
        model: product_image,
        attributes: {
          include: [[sequelize.literal(`IF(LENGTH(path) > 0,CONCAT ('${utils.getUrl()}',path), path)`), 'path']],
        },
      },
      {
        model: product_color,
        attributes: {
          include: [
            [
              sequelize.literal(`(SELECT
                name FROM color
                where id = product_colors.color_id
                LIMIT 1
              )`),
              'color',
            ],
          ],
        },
      },
      {
        model: product_size,
        attributes: {
          include: [
            [
              sequelize.literal(`(SELECT
                name FROM size
                where id = product_sizes.size_id
                LIMIT 1
              )`),
              'size',
            ],
          ],
        },
      },
    ],
  });
  if (!detail) {
    throw apiCode.NOT_FOUND;
  }
  return detail;
}

async function createProduct(req, res) {
  const schema = Joi.object()
    .keys({
      category_id: Joi.number().empty('').required(),
      name: Joi.string().empty('').required(),
      code: Joi.string().empty('').required(),
      price: Joi.number().empty('').required(),
      description: Joi.string(),
      images: Joi.array().required(),
      color_ids: Joi.array().required(),
      size_ids: Joi.array().required(),
    })
    .unknown(true);
  const { category_id, name, code, price, description, images, color_ids, size_ids } = await schema.validateAsync(
    req.body,
  );

  const found = await product.findOne({
    where: { code, is_active: IS_ACTIVE.ACTIVE },
  });
  if (found) {
    throw new Error('Mã code sản phẩm đã tồn tại');
  }
  const result = await sequelize.transaction(async (transaction) => {
    const productCreated = await product.create(
      {
        name,
        code,
        category_id,
        price,
        description,
      },
      { transaction },
    );
    const productColorCreated = color_ids.map((e) => ({ product_id: productCreated.id, color_id: e }));
    await product_color.bulkCreate(productColorCreated, { transaction });
    const productSizeCreated = size_ids.map((e) => ({ product_id: productCreated.id, size_id: e }));
    await product_size.bulkCreate(productSizeCreated, { transaction });
    const productImageCreated = images.map((e) => ({ product_id: productCreated.id, path: e }));
    await product_image.bulkCreate(productImageCreated, { transaction });
    return productCreated;
  });

  return result;
}
async function updateProduct(req, res) {
  const schema = Joi.object()
    .keys({
      category_id: Joi.number().empty('').required(),
      name: Joi.string().empty('').required(),
      code: Joi.string().empty('').required(),
      price: Joi.number().empty('').required(),
      description: Joi.string(),
      status: Joi.number().empty('').required(),
      images: Joi.array().required(),
      color_ids: Joi.array().required(),
      size_ids: Joi.array().required(),
    })
    .unknown(true);
  const { category_id, name, code, price, description, status, images, color_ids, size_ids } =
    await schema.validateAsync(req.body);
  const { id } = req.params;
  const foundProduct = await product.findOne({
    where: { id },
  });
  if (!foundProduct) {
    throw apiCode.NOT_FOUND;
  }
  const foundCode = await product.findOne({
    where: { code, id: { [Op.ne]: id } },
  });
  if (foundCode) {
    throw new Error('Mã sản phẩm đã tồn tại');
  }
  await sequelize.transaction(async (transaction) => {
    await foundProduct.update({
      category_id,
      name,
      code,
      price,
      description,
      status,
      updated_at: new Date(),
    });
    await product_color.destroy({ where: { product_id: id } });
    await product_image.destroy({ where: { product_id: id } });
    await product_size.destroy({ where: { product_id: id } });
    const productColorCreated = color_ids.map((e) => ({ product_id: id, color_id: e }));
    await product_color.bulkCreate(productColorCreated, { transaction });
    const productSizeCreated = size_ids.map((e) => ({ product_id: id, size_id: e }));
    await product_size.bulkCreate(productSizeCreated, { transaction });
    const productImageCreated = images.map((e) => ({ product_id: id, path: e }));
    await product_image.bulkCreate(productImageCreated, { transaction });
  });

  await foundProduct.reload();
  return foundProduct;
}

async function deleteProduct(req, res) {
  const { id } = req.params;
  const foundProduct = await product.findOne({
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
  getDetailProduct,
};
