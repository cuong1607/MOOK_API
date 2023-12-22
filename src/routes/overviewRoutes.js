var express = require('express');
var router = express.Router();
const middleware = require('@middlewares');
const response = require('../common/response');
const overviewController = require('@src/controllers/overviewController');
const { ROLE } = require('@src/utils/constant');
const { wrapHandlerWithJSONResponse } = response;
const supportMiddleware = [
  middleware.authenticateMiddleware.isAuthenticated(),
  middleware.authorizeMiddleware([ROLE.ADMIN]),
  middleware.pagingMiddleware(),
];

router.get('/', supportMiddleware, wrapHandlerWithJSONResponse(overviewController.getAllOverview));

module.exports = router;
