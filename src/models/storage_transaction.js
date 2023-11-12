const Sequelize = require('sequelize');
const { Model } = Sequelize;
const sequelize = require('../config/database');
const { IS_ACTIVE } = require('@src/utils/constant');

class storage_transaction extends Model {}
storage_transaction.init(
  {
    id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    storage_id: {
      type: Sequelize.INTEGER,
      allowNull: true,
    },
    type: {
      type: Sequelize.INTEGER,
      defaultValue: 1,
    },
    storage_change_type_id: {
      type: Sequelize.INTEGER,
      defaultValue: 1,
    },
    amount: {
      type: Sequelize.INTEGER,
      defaultValue: 1,
    },
    stock: {
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
    modelName: 'storage_transaction',
    freezeTableName: true,
    timestamps: false,
    paranoid: true,
  },
);
module.exports = () => storage_transaction;
