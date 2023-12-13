var express = require('express');
var router = express.Router();
const middleware = require('@middlewares');
const response = require('../common/response');
const branchController = require('@controllers/branchController');
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
  .get('/', middleware.pagingMiddleware(), wrapHandlerWithJSONResponse(branchController.getAllBranch))
  .get('/:id', supportMiddleware, wrapHandlerWithJSONResponse(branchController.getDetailBranch))
  .post('/', supportAuthorMiddleware, wrapHandlerWithJSONResponse(branchController.createBranch))
  .patch('/:id', supportAuthorMiddleware, wrapHandlerWithJSONResponse(branchController.updateBranch))
  .delete('/:id', supportAuthorMiddleware, wrapHandlerWithJSONResponse(branchController.deleteBranch));

module.exports = router;
