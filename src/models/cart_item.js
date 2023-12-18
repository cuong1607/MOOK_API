const Sequelize = require('sequelize');
const { Model } = Sequelize;
const sequelize = require('../config/database');
const { IS_ACTIVE } = require('@src/utils/constant');

class cart_item extends Model {}
cart_item.init(
  {
    id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    user_id: {
      type: Sequelize.INTEGER,
      allowNull: true,
    },
    product_price_id: {
      type: Sequelize.INTEGER,
      allowNull: true,
    },
    quantity: {
      type: Sequelize.INTEGER,
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
    modelName: 'cart_item',
    freezeTableName: true,
    timestamps: false,
    paranoid: true,
  },
);
cart_item.associate = (db) => {
  db.cart_item.belongsTo(db.product_price, {
    foreignKey: {
      name: 'product_price_id',
    },
  });
};

module.exports = () => cart_item;
