var express = require('express');
var router = express.Router();
const middleware = require('@middlewares');
const response = require('../common/response');
const storageController = require('@controllers/storageController');
const { ROLE } = require('@src/utils/constant');
const { wrapHandlerWithJSONResponse } = response;
const supportMiddleware = [
  middleware.authenticateMiddleware.isAuthenticated(),
  middleware.authorizeMiddleware([ROLE.ADMIN]),
  middleware.pagingMiddleware(),
];

router
  .get('/', supportMiddleware, wrapHandlerWithJSONResponse(storageController.getAllStorage))
  .get('/:id', supportMiddleware, wrapHandlerWithJSONResponse(storageController.getDetailStorage))
  .patch('/:id', supportMiddleware, wrapHandlerWithJSONResponse(storageController.updateStorage));

module.exports = router;
