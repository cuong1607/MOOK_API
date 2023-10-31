var express = require('express');
var router = express.Router();
const middleware = require('@middlewares');
const response = require('../common/response');
const productController = require('@controllers/productController');
const { ROLE } = require('@src/utils/constant');
const { wrapHandlerWithJSONResponse } = response;
const supportMiddleware = [
  middleware.authenticateMiddleware.isAuthenticated(),
  middleware.authorizeMiddleware([ROLE.ADMIN]),
  middleware.pagingMiddleware(),
];

router
  .get('/', middleware.pagingMiddleware(), wrapHandlerWithJSONResponse(productController.getAllProduct))
  .get('/:id', wrapHandlerWithJSONResponse(productController.getDetailProduct))
  .post('/', supportMiddleware, wrapHandlerWithJSONResponse(productController.createProduct))
  .patch('/:id', supportMiddleware, wrapHandlerWithJSONResponse(productController.updateProduct))
  .delete('/:id', supportMiddleware, wrapHandlerWithJSONResponse(productController.deleteProduct));

module.exports = router;
