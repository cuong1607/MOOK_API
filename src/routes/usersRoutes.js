var express = require('express');
var router = express.Router();
const middleware = require('@middlewares');
const response = require('../common/response');
const userController = require('@controllers/userController');
const { ROLE } = require('@src/utils/constant');
const { wrapHandlerWithJSONResponse } = response;
const supportMiddleware = [
  middleware.authenticateMiddleware.isAuthenticated(),
  middleware.authorizeMiddleware([ROLE.ADMIN]),
  middleware.pagingMiddleware(),
];
/* GET users listing. */
router
  .get('/', supportMiddleware, wrapHandlerWithJSONResponse(userController.getAllUser))
  .get('/:id', supportMiddleware, wrapHandlerWithJSONResponse(userController.getDetailUser))
  .post('/', supportMiddleware, wrapHandlerWithJSONResponse(userController.createUser))
  .patch('/:id', supportMiddleware, wrapHandlerWithJSONResponse(userController.updateUser))
  .patch('/:id/reset-password', supportMiddleware, wrapHandlerWithJSONResponse(userController.resetPassword))
  .delete('/:id', supportMiddleware, wrapHandlerWithJSONResponse(userController.deleteUser));

module.exports = router;
