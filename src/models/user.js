const Sequelize = require('sequelize');

const { Model } = Sequelize;
const sequelize = require('../config/database');
const auth = require('@config/auth');
const { IS_ACTIVE } = require('@src/utils/constant');

class user extends Model {}
user.init(
  {
    id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    full_name: {
      type: Sequelize.STRING(255),
      allowNull: true,
    },
    user_name: {
      type: Sequelize.STRING(255),
      allowNull: true,
    },
    phone: {
      type: Sequelize.STRING(32),
      allowNull: false,
    },
    password: {
      type: Sequelize.STRING(200),
      allowNull: false,
    },
    token: {
      type: Sequelize.STRING(200),
      allowNull: true,
    },
    avatar: {
      type: Sequelize.STRING(200),
      allowNull: true,
    },
    email: {
      type: Sequelize.STRING(45),
      allowNull: true,
    },
    role_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    gender_id: {
      type: Sequelize.INTEGER,
      allowNull: true,
    },
    avatar: {
      type: Sequelize.TEXT,
      allowNull: true,
    },
    is_active: {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: IS_ACTIVE.ACTIVE,
    },
    created_by: {
      type: Sequelize.INTEGER,
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
    deleted_at: {
      type: Sequelize.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'user',
    freezeTableName: true,
    timestamps: false,
    paranoid: true,
  },
);
user.associate = (db) => {
  db.user.hasMany(db.order, {
    foreignKey: {
      name: 'user_id',
    },
  });
};

user.prototype.generateToken = function generateToken() {
  return auth.createJWToken({
    id: this.id,
    phone: this.phone,
    role_id: this.role_id,
  });
};

module.exports = () => user;
