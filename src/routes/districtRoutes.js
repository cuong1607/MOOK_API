var express = require('express');
var router = express.Router();
const middleware = require('@middlewares');
const response = require('../common/response');
const districtController = require('@controllers/districtController');
const { ROLE } = require('@src/utils/constant');
const { wrapHandlerWithJSONResponse } = response;

router.get('/', middleware.pagingMiddleware(), wrapHandlerWithJSONResponse(districtController.getAllDistrict));

module.exports = router;
