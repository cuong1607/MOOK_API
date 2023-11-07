var express = require('express');
var router = express.Router();
const middleware = require('@middlewares');
const response = require('../common/response');
const fileController = require('@controllers/fileController');
const { ROLE } = require('@src/utils/constant');
const { wrapHandlerWithJSONResponse } = response;
const supportAuthorMiddleware = [
  middleware.authenticateMiddleware.isAuthenticated(),
  middleware.authorizeMiddleware([ROLE.ADMIN, ROLE.USER]),
  middleware.pagingMiddleware(),
];

router
  .post('/single/:id', supportAuthorMiddleware, wrapHandlerWithJSONResponse(fileController.uploadSingleFile))
  .post('/multiple/:id', supportAuthorMiddleware, wrapHandlerWithJSONResponse(fileController.uploadMultipleFile));

module.exports = router;
