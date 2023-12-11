var express = require('express');
var router = express.Router();
const middleware = require('@middlewares');
const response = require('../common/response');
const priceController = require('@controllers/priceController');
const { ROLE } = require('@src/utils/constant');
const { wrapHandlerWithJSONResponse } = response;

const supportMiddlewareNoToken = [
  middleware.authorizeMiddleware([ROLE.USER, ROLE.ADMIN]),
  middleware.pagingMiddleware(),
];
const supportMiddleware = [
  middleware.authenticateMiddleware.isAuthenticated(),
  middleware.authorizeMiddleware([ROLE.USER, ROLE.ADMIN]),
  middleware.pagingMiddleware(),
];

const supportAuthorMiddleware = [
  middleware.authenticateMiddleware.isAuthenticated(),
  middleware.authorizeMiddleware([ROLE.ADMIN]),
  middleware.pagingMiddleware(),
];

router
  .get('/', supportMiddlewareNoToken, wrapHandlerWithJSONResponse(priceController.getAllPrice))
  .get('/:id', supportMiddleware, wrapHandlerWithJSONResponse(priceController.getDetailPrice))
  .post('/', supportAuthorMiddleware, wrapHandlerWithJSONResponse(priceController.createPrice))
  .patch('/:id', supportAuthorMiddleware, wrapHandlerWithJSONResponse(priceController.updatePrice))
  .delete('/:id', supportAuthorMiddleware, wrapHandlerWithJSONResponse(priceController.deletePrice));

module.exports = router;
