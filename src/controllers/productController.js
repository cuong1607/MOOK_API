const db = require('../models');
const {
  product,
  category,
  product_color,
  product_image,
  product_size,
  price_group,
  storage,
  storage_transaction,
  product_price,
  branch,
} = db;
const { config, apiCode, IS_ACTIVE, STORAGE_TYPE, STORAGE_CHANGE_TYPE } = require('@utils/constant');
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
      branch_id: Joi.number().empty(''),
      price_group_id: Joi.number(),
      color_ids: Joi.string(),
      size_ids: Joi.string(),
    })
    .unknown(true);
  const whereCondition = { is_active: IS_ACTIVE.ACTIVE, [Op.and]: [] };

  const { category_id, search, branch_id, color_ids, price_group_id } = await schema.validateAsync(req.query);
  if (category_id) {
    whereCondition.category_id = category_id;
  }
  if (branch_id) {
    whereCondition.branch_id = branch_id;
  }
  if (search) {
    whereCondition.name = { [Op.substring]: search };
  }
  if (color_ids) {
    const productColor = await product_price.findAll({
      where: {
        color_id: { [Op.in]: color_ids.split(',') },
      },
    });
    const productIDs = productColor.map((data) => data.product_id);
    whereCondition[Op.and].push({ id: { [Op.in]: productIDs } });
  }
  if (price_group_id) {
    const priceGroup = await price_group.findOne({ where: { id: price_group_id } });
    whereCondition.price = {
      [Op.and]: [{ [Op.gte]: priceGroup.min_price }, { [Op.lte]: priceGroup.max_price }],
    };
  }
  const count = await product.count({ where: whereCondition });
  const { rows } = await product.findAndCountAll({
    where: whereCondition,
    include: [
      {
        model: product_image,
        attributes: {
          include: [[sequelize.literal(`IF(LENGTH(path) > 0,CONCAT ('${utils.getUrl()}',path), path)`), 'path']],
        },
      },
      {
        model: category,
        attributes: ['id', 'name'], // Chọn các trường 'id' và 'name' của mô hình category
      },
      {
        model: branch,
        attributes: ['id', 'name'], // Chọn các trường 'id' và 'name' của mô hình branch
      },
      {
        model: product_price,
        attributes: {
          include: [
            [
              sequelize.literal(`(SELECT
                code FROM color
                where id = product_prices.color_id
                LIMIT 1
              )`),
              'code',
            ],
            [
              sequelize.literal(`(SELECT
                name FROM color
                where id = product_prices.color_id
                LIMIT 1
              )`),
              'color',
            ],
          ],
        },
        where: {
          is_active: IS_ACTIVE.ACTIVE,
        },
      },
    ],

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
        model: product_price,
        attributes: {
          include: [
            [
              sequelize.literal(`(SELECT
                name FROM color
                where id = product_prices.color_id
                LIMIT 1
              )`),
              'color',
            ],
            [
              sequelize.literal(`(SELECT
                code FROM color
                where id = product_prices.color_id
                LIMIT 1
              )`),
              'code',
            ],
          ],
        },
        where: {
          is_active: IS_ACTIVE.ACTIVE,
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
      branch_id: Joi.number().empty('').required(),
      name: Joi.string().empty('').required(),
      code: Joi.string().empty('').required(),
      description: Joi.string(),
      images: Joi.array().required(),
      product_prices: Joi.array(),
    })
    .unknown(true);
  const { category_id, name, code, description, images, product_prices, branch_id } = await schema.validateAsync(
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
        branch_id,
        description,
      },
      { transaction },
    );
    // const productColorCreated = color_ids.map((e) => ({ product_id: productCreated.id, color_id: e }));
    // await product_color.bulkCreate(productColorCreated, { transaction });
    // const productSizeCreated = size_ids.map((e) => ({ product_id: productCreated.id, size_id: e }));
    // await product_size.bulkCreate(productSizeCreated, { transaction });
    const productImageCreated = images.map((e) => ({ product_id: productCreated.id, path: e }));
    await product_image.bulkCreate(productImageCreated, { transaction });

    for (let index = 0; index < product_prices.length; index++) {
      const productPrice = await product_price.create(
        {
          color_id: product_prices[index].color_id,
          product_id: productCreated.id,
          price: product_prices[index].price,
          amount: product_prices[index].amount,
          discount: product_prices[index].discount,
        },
        { transaction },
      );
      const stroageCreated = await storage.create(
        {
          product_price_id: productPrice.id,
          stock: product_prices[index].amount,
          receipt: product_prices[index].amount,
          issue: 0,
        },
        { transaction },
      );
      await storage_transaction.create({
        storage_id: stroageCreated.id,
        type: STORAGE_TYPE.ADD,
        storage_change_type_id: STORAGE_CHANGE_TYPE.CREATE_STORAGE,
        amount: product_prices[index].amount,
        stock: product_prices[index].amount,
      });
    }

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
      description: Joi.string(),
      status: Joi.number().empty('').required(),
      images: Joi.array().required(),
      color_ids: Joi.array().required(),
      size_ids: Joi.array().required(),
    })
    .unknown(true);
  const { category_id, name, code, description, status, images } = await schema.validateAsync(req.body);
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
    await foundProduct.update(
      {
        category_id,
        name,
        code,
        description,
        status,
        updated_at: new Date(),
      },
      { transaction },
    );
    await product_image.destroy({ where: { product_id: id } }, { transaction });
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
