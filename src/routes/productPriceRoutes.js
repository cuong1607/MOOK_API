var express = require('express');
var router = express.Router();
const middleware = require('@middlewares');
const response = require('../common/response');
const productPriceController = require('@controllers/productPriceController');
const { ROLE } = require('@src/utils/constant');
const { wrapHandlerWithJSONResponse } = response;
const supportMiddleware = [
  middleware.authenticateMiddleware.isAuthenticated(),
  middleware.authorizeMiddleware([ROLE.ADMIN]),
  middleware.pagingMiddleware(),
];

router
  .get('/', middleware.pagingMiddleware(), wrapHandlerWithJSONResponse(productPriceController.getAllProduct))
  .post('/', middleware.pagingMiddleware(), wrapHandlerWithJSONResponse(productPriceController.createProduct))
  .patch('/:id', middleware.pagingMiddleware(), wrapHandlerWithJSONResponse(productPriceController.updateProduct))
  .delete('/:id', middleware.pagingMiddleware(), wrapHandlerWithJSONResponse(productPriceController.deleteProduct));

module.exports = router;
