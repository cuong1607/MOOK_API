const Sequelize = require('sequelize');
const { Model } = Sequelize;
const sequelize = require('../config/database');
const { IS_ACTIVE } = require('@src/utils/constant');

class product_price extends Model {}
product_price.init(
  {
    id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    color_id: {
      type: Sequelize.INTEGER,
      allowNull: true,
    },
    product_id: {
      type: Sequelize.INTEGER,
      allowNull: true,
    },
    price: {
      type: Sequelize.DECIMAL(18, 0),
      allowNull: true,
    },
    amount: {
      type: Sequelize.INTEGER,
      allowNull: true,
    },
    discount: {
      type: Sequelize.DECIMAL(18, 0),
      allowNull: true,
    },
    is_active: {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: IS_ACTIVE.ACTIVE,
    },
    created_at: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
    },
    updated_at: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
    },
  },
  {
    sequelize,
    modelName: 'product_price',
    freezeTableName: true,
    timestamps: false,
    paranoid: true,
  },
);
product_price.associate = (db) => {
  db.product_price.belongsTo(db.product, {
    foreignKey: {
      name: 'product_id',
    },
  });
  db.product_price.belongsTo(db.color, {
    foreignKey: {
      name: 'color_id',
    },
  });
  db.product_price.hasMany(db.storage, {
    foreignKey: {
      name: 'product_id',
    },
  });
  db.product_price.hasMany(db.order_item, {
    foreignKey: {
      name: 'product_price_id',
    },
  });
};

module.exports = () => product_price;
