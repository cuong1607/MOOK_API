const Sequelize = require('sequelize');
const { Model } = Sequelize;
const sequelize = require('../config/database');
const { IS_ACTIVE } = require('@src/utils/constant');

class product_color extends Model {}
product_color.init(
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
    modelName: 'product_color',
    freezeTableName: true,
    timestamps: false,
    paranoid: true,
  },
);
product_color.associate = (db) => {
  db.product_color.belongsTo(db.product, {
    foreignKey: {
      name: 'product_id',
    },
  });
};
module.exports = () => product_color;
