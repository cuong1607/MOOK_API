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
  .get('/', middleware.pagingMiddleware(), wrapHandlerWithJSONResponse(orderController.getAllOrder))
  .get('/:id', middleware.pagingMiddleware(), wrapHandlerWithJSONResponse(orderController.getDetailOrder))
  .post('/', middleware.pagingMiddleware(), wrapHandlerWithJSONResponse(orderController.createOrder))
  .patch('/:id/cancel', middleware.pagingMiddleware(), wrapHandlerWithJSONResponse(orderController.cancleOrder));

module.exports = router;
