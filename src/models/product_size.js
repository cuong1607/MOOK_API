const Sequelize = require('sequelize');
const { Model } = Sequelize;
const sequelize = require('../config/database');
const { IS_ACTIVE } = require('@src/utils/constant');

class product_size extends Model {}
product_size.init(
  {
    id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    size_id: {
      type: Sequelize.INTEGER,
      allowNull: true,
    },
    product_id: {
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
    modelName: 'product_size',
    freezeTableName: true,
    timestamps: false,
    paranoid: true,
  },
);
product_size.associate = (db) => {
  db.product_size.belongsTo(db.product, {
    foreignKey: {
      name: 'product_id',
    },
  });
};

module.exports = () => product_size;
