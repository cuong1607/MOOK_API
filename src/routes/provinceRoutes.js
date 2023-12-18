var express = require('express');
var router = express.Router();
const middleware = require('@middlewares');
const response = require('../common/response');
const provinceController = require('@controllers/provinceController');
const { ROLE } = require('@src/utils/constant');
const { wrapHandlerWithJSONResponse } = response;

router.get('/', middleware.pagingMiddleware(), wrapHandlerWithJSONResponse(provinceController.getAllProvince));

module.exports = router;
