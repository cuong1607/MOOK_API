const Sequelize = require('sequelize');
require('dotenv').config();

const env = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'Trungkien97@',
  database: process.env.DB_NAME || 'base_nestjs',
  port: process.env.DB_PORT || '3306',
};
console.log(env);
const sequelize = new Sequelize(env.database, env.user, env.password, {
  host: env.host,
  port: env.port,
  dialect: 'mysql',
  query: { raw: false },
  timezone: '+00:00',
  dialectOptions: {
    multipleStatements: true,
  },
  pool: {
    max: 30,
    min: 0,
    acquire: 60000,
    idle: 5000,
  },
  define: {
    hooks: true,
  },
});

module.exports = sequelize;
