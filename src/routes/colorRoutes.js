var express = require('express');
var router = express.Router();
const middleware = require('@middlewares');
const response = require('../common/response');
const colorController = require('@controllers/colorController');
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
  .get('/', supportMiddleware, wrapHandlerWithJSONResponse(colorController.getAllColor))
  .get('/:id', supportMiddleware, wrapHandlerWithJSONResponse(colorController.getDetailColor))
  .post('/', supportAuthorMiddleware, wrapHandlerWithJSONResponse(colorController.createColor))
  .patch('/:id', supportAuthorMiddleware, wrapHandlerWithJSONResponse(colorController.updateColor))
  .delete('/:id', supportAuthorMiddleware, wrapHandlerWithJSONResponse(colorController.deleteColor));

module.exports = router;
