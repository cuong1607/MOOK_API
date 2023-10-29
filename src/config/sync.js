require('module-alias/register');
const models = require('@models');

models.sequelize
  .sync({ force: false, alter: true })
  // xóa hết rồi thêm lại
  // .sync({ force: true })
  .then((res) => {
    console.log(res);
  })
  .catch((err) => {
    throw new Error(err);
  });
