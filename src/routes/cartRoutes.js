var express = require('express');
var router = express.Router();
const middleware = require('@middlewares');
const response = require('../common/response');
const cartController = require('@controllers/cartController');
const { ROLE } = require('@src/utils/constant');
const { wrapHandlerWithJSONResponse } = response;
const supportMiddleware = [
  middleware.authenticateMiddleware.isAuthenticated(),
  middleware.authorizeMiddleware([ROLE.USER]),
  middleware.pagingMiddleware(),
];

router
  .get('/', supportMiddleware, wrapHandlerWithJSONResponse(cartController.getAllCart))
  .get('/:id', supportMiddleware, wrapHandlerWithJSONResponse(cartController.getDetailCart))
  .post('/', supportMiddleware, wrapHandlerWithJSONResponse(cartController.createCart))
  .patch('/:id', supportMiddleware, wrapHandlerWithJSONResponse(cartController.updateCart))
  .delete('/:id', supportMiddleware, wrapHandlerWithJSONResponse(cartController.deleteCart));

module.exports = router;
