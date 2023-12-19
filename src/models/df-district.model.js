const Sequelize = require('sequelize');
const { Model } = Sequelize;
const sequelize = require('../config/database');
const { IS_ACTIVE } = require('@src/utils/constant');
class df_district extends Model {}
df_district.init(
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
    value: {
      type: Sequelize.TEXT,
      allowNull: true,
    },
    df_province_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
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
    modelName: 'df_district',
    freezeTableName: true,
    timestamps: false,
    paranoid: true,
  },
);
df_district.associate = (db) => {
  db.df_district.hasMany(db.address_book, {
    foreignKey: {
      name: 'df_district_id',
    },
  });
};
module.exports = () => df_district;
