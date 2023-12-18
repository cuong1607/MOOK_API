const Sequelize = require('sequelize');
const { Model } = Sequelize;
const sequelize = require('../config/database');
const { IS_ACTIVE } = require('@src/utils/constant');

class product extends Model {}
product.init(
  {
    id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    category_id: {
      type: Sequelize.INTEGER,
    },
    branch_id: {
      type: Sequelize.INTEGER,
    },
    code: {
      type: Sequelize.TEXT,
      allowNull: true,
    },
    name: {
      type: Sequelize.TEXT,
      allowNull: true,
    },
    price: {
      type: Sequelize.INTEGER,
    },
    description: {
      type: Sequelize.TEXT,
      allowNull: true,
    },
    status: {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: IS_ACTIVE.ACTIVE,
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
    modelName: 'product',
    freezeTableName: true,
    timestamps: false,
    paranoid: true,
  },
);
product.associate = (db) => {
  db.product.belongsTo(db.category, {
    foreignKey: {
      name: 'category_id',
    },
  });

  db.product.belongsTo(db.branch, {
    foreignKey: {
      name: 'branch_id',
    },
  });

  db.product.hasMany(db.product_price, {
    foreignKey: {
      name: 'product_id',
    },
  });

  db.product.hasOne(db.cart_item, {
    foreignKey: {
      name: 'product_id',
    },
  });
  db.product.hasMany(db.product_image, {
    foreignKey: {
      name: 'product_id',
    },
  });
  db.product.hasMany(db.product_color, {
    foreignKey: {
      name: 'product_id',
    },
  });
  db.product.hasMany(db.product_size, {
    foreignKey: {
      name: 'product_id',
    },
  });
  db.product.hasMany(db.storage, {
    foreignKey: {
      name: 'product_id',
    },
  });
};

module.exports = () => product;
