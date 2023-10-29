const { config } = require('@utils/constant');
const Joi = require('joi');

const PAGING_LIMIT_MAX = 1000;
const PagingValidator = Joi.object({
  page: Joi.number().empty('undefined', 'null', '').min(1).default(1).failover(1),
  limit: Joi.number().empty('undefined', 'null', '').min(1).default(config.PAGING_LIMIT).failover(config.PAGING_LIMIT),
}).unknown(true);
module.exports = function () {
  return async (req, res, next) => {
    const paging = {
      page: 1,
      limit: config.PAGING_LIMIT,
      offset: 0,
    };
    try {
      let { page = 1, limit = config.PAGING_LIMIT } = await PagingValidator.validateAsync(req.query);
      if (limit <= 0 || limit > PAGING_LIMIT_MAX) {
        limit = PAGING_LIMIT_MAX;
      }
      paging.page = Math.max(page, 1);
      paging.limit = limit;
    } finally {
      paging.offset = (paging.page - 1) * paging.limit;
      Object.assign(req.query, paging);
      req.pagination = paging;
      next();
    }
  };
};
