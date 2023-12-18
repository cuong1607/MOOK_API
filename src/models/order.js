const Sequelize = require('sequelize');
const { Model } = Sequelize;
const sequelize = require('../config/database');
const { IS_ACTIVE, PAYMENT_METHOD, ORDER_STATUS, PAYMENT_STATUS } = require('@src/utils/constant');

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
      defaultValue: ORDER_STATUS.PENDING,
    },
    payment_method: {
      type: Sequelize.INTEGER,
      defaultValue: PAYMENT_METHOD.COD,
    },
    payment_status: {
      type: Sequelize.INTEGER,
      defaultValue: PAYMENT_STATUS.PENDING,
    },
    note: {
      type: Sequelize.TEXT,
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
  db.order.hasMany(db.order_state, {
    foreignKey: {
      name: 'order_id',
    },
  });
  db.order.belongsTo(db.user, {
    foreignKey: {
      name: 'user_id',
    },
  });
};
module.exports = () => order;
