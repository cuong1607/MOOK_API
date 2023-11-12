var express = require('express');
var router = express.Router();
const middleware = require('@middlewares');
const response = require('../common/response');
const adminOrderController = require('@controllers/adminOrderController');
const { ROLE } = require('@src/utils/constant');
const { wrapHandlerWithJSONResponse } = response;
const supportMiddleware = [
  middleware.authenticateMiddleware.isAuthenticated(),
  middleware.authorizeMiddleware([ROLE.ADMIN]),
  middleware.pagingMiddleware(),
];

router
  .get('/', supportMiddleware, wrapHandlerWithJSONResponse(adminOrderController.getAllOrder))
  .get('/:id', supportMiddleware, wrapHandlerWithJSONResponse(adminOrderController.getDetailOrder))
  .post('/', supportMiddleware, wrapHandlerWithJSONResponse(adminOrderController.createOrder))
  .patch('/:id/status', supportMiddleware, wrapHandlerWithJSONResponse(adminOrderController.updateStatusOrder))
  .patch('/:id/deny', supportMiddleware, wrapHandlerWithJSONResponse(adminOrderController.denyOrder));

module.exports = router;
