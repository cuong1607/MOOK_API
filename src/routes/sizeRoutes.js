var express = require('express');
var router = express.Router();
const middleware = require('@middlewares');
const response = require('../common/response');
const sizeController = require('@controllers/sizeController');
const { ROLE } = require('@src/utils/constant');
const { wrapHandlerWithJSONResponse } = response;
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
  .get('/', supportMiddleware, wrapHandlerWithJSONResponse(sizeController.getAllSize))
  .get('/:id', supportMiddleware, wrapHandlerWithJSONResponse(sizeController.getDetailSize))
  .post('/', supportAuthorMiddleware, wrapHandlerWithJSONResponse(sizeController.createSize))
  .patch('/:id', supportAuthorMiddleware, wrapHandlerWithJSONResponse(sizeController.updateSize))
  .delete('/:id', supportAuthorMiddleware, wrapHandlerWithJSONResponse(sizeController.deleteSize));

module.exports = router;
