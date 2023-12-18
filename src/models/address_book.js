const Sequelize = require('sequelize');
const { Model } = Sequelize;
const sequelize = require('../config/database');
const { IS_ACTIVE } = require('@src/utils/constant');

class address_book extends Model {}
address_book.init(
  {
    id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: Sequelize.TEXT,
      allowNull: true,
    },
    phone_number: {
      type: Sequelize.TEXT,
      allowNull: true,
    },
    order_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    df_province_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    df_district_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    df_ward_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    address: {
      type: Sequelize.TEXT,
      allowNull: true,
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
    modelName: 'address_book',
    freezeTableName: true,
    timestamps: false,
    paranoid: true,
  },
);

module.exports = () => address_book;
