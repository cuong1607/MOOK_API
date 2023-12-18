var express = require('express');
var router = express.Router();
const middleware = require('@middlewares');
const response = require('../common/response');
const wardController = require('@controllers/wardController');
const { ROLE } = require('@src/utils/constant');
const { wrapHandlerWithJSONResponse } = response;

router.get('/', middleware.pagingMiddleware(), wrapHandlerWithJSONResponse(wardController.getAllWard));

module.exports = router;
