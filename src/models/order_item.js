const Sequelize = require('sequelize');
const { Model } = Sequelize;
const sequelize = require('../config/database');
const { IS_ACTIVE } = require('@src/utils/constant');

class order_item extends Model {}
order_item.init(
  {
    id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    order_id: {
      type: Sequelize.INTEGER,
      allowNull: true,
    },
    product_id: {
      type: Sequelize.INTEGER,
      allowNull: true,
    },
    quantity: {
      type: Sequelize.INTEGER,
      allowNull: true,
    },
    price: {
      type: Sequelize.INTEGER,
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
    modelName: 'order_item',
    freezeTableName: true,
    timestamps: false,
    paranoid: true,
  },
);

order_item.associate = (db) => {
  db.order_item.belongsTo(db.order, {
    foreignKey: {
      name: 'order_id',
    },
  });
};
module.exports = () => order_item;
