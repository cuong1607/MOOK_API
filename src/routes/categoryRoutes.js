var express = require('express');
var router = express.Router();
const middleware = require('@middlewares');
const response = require('../common/response');
const categoryController = require('@controllers/categoryController');
const { ROLE } = require('@src/utils/constant');
const { wrapHandlerWithJSONResponse } = response;
const supportMiddleware = [
  middleware.authenticateMiddleware.isAuthenticated(),
  middleware.authorizeMiddleware([ROLE.ADMIN]),
  middleware.pagingMiddleware(),
];

router
  .get('/', middleware.pagingMiddleware(), wrapHandlerWithJSONResponse(categoryController.getAllcategory))
  .get('/:id', wrapHandlerWithJSONResponse(categoryController.getDetailCategory))
  .post('/', supportMiddleware, wrapHandlerWithJSONResponse(categoryController.createCategory))
  .patch('/:id', supportMiddleware, wrapHandlerWithJSONResponse(categoryController.updateCategory))
  .delete('/:id', supportMiddleware, wrapHandlerWithJSONResponse(categoryController.deleteCategory));

module.exports = router;
