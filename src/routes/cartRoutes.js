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
  .get('/', middleware.pagingMiddleware(), wrapHandlerWithJSONResponse(cartController.getAllCart))
  .get('/:id', middleware.pagingMiddleware(), wrapHandlerWithJSONResponse(cartController.getDetailCart))
  .post('/', middleware.pagingMiddleware(), wrapHandlerWithJSONResponse(cartController.createCart))
  .patch('/:id', middleware.pagingMiddleware(), wrapHandlerWithJSONResponse(cartController.updateCart))
  .delete('/:id', middleware.pagingMiddleware(), wrapHandlerWithJSONResponse(cartController.deleteCart));

module.exports = router;
