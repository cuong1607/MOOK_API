var express = require('express');
var router = express.Router();
const middleware = require('@middlewares');
const response = require('../common/response');
const orderController = require('@controllers/orderController');
const { ROLE } = require('@src/utils/constant');
const { wrapHandlerWithJSONResponse } = response;
const supportMiddleware = [
  middleware.authenticateMiddleware.isAuthenticated(),
  middleware.authorizeMiddleware([ROLE.USER]),
  middleware.pagingMiddleware(),
];

router
  .get('/', supportMiddleware, wrapHandlerWithJSONResponse(orderController.getAllOrder))
  .get('/:id', supportMiddleware, wrapHandlerWithJSONResponse(orderController.getDetailOrder))
  .post('/', supportMiddleware, wrapHandlerWithJSONResponse(orderController.createOrder))
  .patch('/:id/cancel', supportMiddleware, wrapHandlerWithJSONResponse(orderController.cancleOrder));

module.exports = router;
