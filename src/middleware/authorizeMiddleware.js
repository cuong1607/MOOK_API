/* eslint-disable no-param-reassign */
const { apiCode } = require('@utils/constant');

module.exports = function (roles = []) {
  if (typeof roles === 'string') {
    roles = [roles];
  }

  return (req, res, next) => {
    if (req.auth && roles.length && !roles.includes(req.auth.role_id)) {
      return res.json({
        status: 0,
        code: apiCode.NO_PERMISSION.code,
        msg: apiCode.NO_PERMISSION.message,
        ex: '',
        data: {},
      });
    }
    next();
  };
};
