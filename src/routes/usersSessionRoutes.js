var express = require('express');
var router = express.Router();
const middleware = require('@middlewares');
const response = require('../common/response');
const userSesionController = require('@controllers/userSessionController');
const { wrapHandlerWithJSONResponse } = response;

router
  .post('/login', wrapHandlerWithJSONResponse(userSesionController.login))
  .post('/register', wrapHandlerWithJSONResponse(userSesionController.register))
  .post(
    '/logout',
    middleware.authenticateMiddleware.isAuthenticated(),
    wrapHandlerWithJSONResponse(userSesionController.logout),
  )
  .get(
    '/me',
    middleware.authenticateMiddleware.isAuthenticated(),
    wrapHandlerWithJSONResponse(userSesionController.getInfor),
  )
  .post(
    '/update',
    middleware.authenticateMiddleware.isAuthenticated(),
    wrapHandlerWithJSONResponse(userSesionController.updateInfor),
  );

module.exports = router;
