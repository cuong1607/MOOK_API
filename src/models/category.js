const Sequelize = require('sequelize');
const { Model } = Sequelize;
const sequelize = require('../config/database');
const { IS_ACTIVE } = require('@src/utils/constant');

class category extends Model {}
category.init(
  {
    id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    code: {
      type: Sequelize.TEXT,
      allowNull: true,
    },
    name: {
      type: Sequelize.TEXT,
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
    modelName: 'category',
    freezeTableName: true,
    timestamps: false,
    paranoid: true,
  },
);
category.associate = (db) => {
  db.category.hasOne(db.product, {
    foreignKey: {
      name: 'category_id',
    },
  });
};
module.exports = () => category;
