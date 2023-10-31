const Sequelize = require('sequelize');
const { Model } = Sequelize;
const sequelize = require('../config/database');
const { IS_ACTIVE } = require('@src/utils/constant');

class order extends Model {}
order.init(
  {
    id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    code: { type: Sequelize.TEXT },
    user_id: {
      type: Sequelize.INTEGER,
      allowNull: true,
    },
    status: {
      type: Sequelize.INTEGER,
      defaultValue: 1,
    },
    note: {
      type: Sequelize.TEXT,
      defaultValue: 1,
    },
    total_price: {
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
    modelName: 'order',
    freezeTableName: true,
    timestamps: false,
    paranoid: true,
  },
);
order.associate = (db) => {
  db.order.hasMany(db.order_item, {
    foreignKey: {
      name: 'order_id',
    },
  });
};
module.exports = () => order;
