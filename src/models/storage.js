const Sequelize = require('sequelize');
const { Model } = Sequelize;
const sequelize = require('../config/database');
const { IS_ACTIVE } = require('@src/utils/constant');

class storage extends Model {}
storage.init(
  {
    id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    product_price_id: {
      type: Sequelize.INTEGER,
      allowNull: true,
    },
    stock: {
      type: Sequelize.INTEGER,
      defaultValue: 1,
    },
    receipt: {
      type: Sequelize.INTEGER,
      defaultValue: 1,
    },
    issue: {
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
    modelName: 'storage',
    freezeTableName: true,
    timestamps: false,
    paranoid: true,
  },
);

storage.associate = (db) => {
  db.storage.belongsTo(db.product_price, {
    foreignKey: {
      name: 'product_price_id',
    },
  });
};
module.exports = () => storage;
