const _ = require('lodash');
const { config } = require('@utils/constant');
const { debug } = require('@utils/constant');

class PagingResponse {
  constructor(data, { page, totalItemCount, limit }) {
    this.data = data;
    this.paging = { page, totalItemCount, limit };
  }
}
class PagingByCursorResponse {
  constructor(data, { limit, next, previous }) {
    this.data = data;
    this.paging = { limit, next, previous };
  }
}

function wrapErrorJSON(error, message = null, ex = '') {
  return {
    status: 0,
    code: error.code,
    msg: message || error.message,
    ex: ex || ex,
    data: {},
  };
}
function wrapSuccessJSON(data, message = 'Thành công', count = null, page = 0) {
  return {
    status: 1,
    code: 1,
    msg: message,
    data,
    paging: count ? { page, totalItemCount: count, limit: config.PAGING_LIMIT } : null,
  };
}
function wrapHandlerWithJSONResponse(handler) {
  return async function (req, res, next) {
    try {
      let result = await handler(req, res);
      if (!_.isObject(result) || !result.data) {
        result = { data: result };
      }
      res.json({
        status: 1,
        code: 1,
        msg: 'Thành công',
        ...result,
      });
    } catch (error) {
      // next(error);
      debug.error(error);
      //res.json(wrapErrorJSON(error));
      next(error);
    }
  };
}

module.exports = {
  error: wrapErrorJSON,
  success: wrapSuccessJSON,
  wrapHandlerWithJSONResponse,
  PagingResponse,
  PagingByCursorResponse,
};
