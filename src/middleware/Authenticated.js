const compose = require('composable-middleware');
const { apiCode } = require('@utils/constant');
const AUTHORIZATION_STRATEGY = {
  hmacSha256: 'HMAC-SHA256',
  apiKey: 'API_KEY',
  token: 'TOKEN',
  master: 'MASTER',
};
const auth = require('@config/auth');
const db = require('../models');
const { user } = db;
const Sequelize = require('sequelize');

const SupportAuthorTypes = [
  AUTHORIZATION_STRATEGY.hmacSha256,
  AUTHORIZATION_STRATEGY.apiKey,
  AUTHORIZATION_STRATEGY.token,
  AUTHORIZATION_STRATEGY.master,
];
const AuthorTypeHandlers = {
  [AUTHORIZATION_STRATEGY.token]: async (req) =>
    validateLoginToken(req, { extractToken: extractTokenHeader, allowNextAfterError: true }),
};

module.exports = {
  AUTHORIZATION_STRATEGY,
  isGuest: function isGuest() {
    return compose().use((req, res, next) => {
      next();
    });
  },
  isAuthenticated: function isAuthenticated() {
    return compose().use(async (req, res, next) => {
      try {
        const handler = AuthorTypeHandlers['TOKEN'];
        console.log('handler', handler);
        if (handler) {
          try {
            // eslint-disable-next-line no-await-in-loop
            const authUser = await handler(req, res, next);
            if (authUser) {
              req.auth = authUser;
              return next();
            }
          } catch (err) {
            return next(err);
            // return res.json(response.error(err));
          }
        }
      } finally {
        // console.timeEnd(`authToken:${req.path}`);
      }
      return next(apiCode.INVALID_ACCESS_TOKEN);
      // return res.json(response.error(apiCode.INVALID_ACCESS_TOKEN));
    });
  },
};

async function validateLoginToken(req, { extractToken, allowNextAfterError }) {
  try {
    const token = extractToken(req);
    await auth.verifyJWTToken(token);
    const authUserData = await getUserFromToken(token);
    if (!authUserData) {
      throw new AppError(apiCode.INVALID_ACCESS_TOKEN.code, 'Không tìm thấy thông tin người dùng');
    }
    console.log('authUserData', authUserData);
    return authUserData;
  } catch (error) {
    if (error instanceof Sequelize.BaseError) {
      throw error;
    }

    if (allowNextAfterError) {
      return null;
    }
    throw error;
  }
}

function extractTokenHeader(req) {
  return req.headers && req.headers.token;
}

async function getUserFromToken(token) {
  if (!token) {
    throw new AppError(apiCode.UNAUTHORIZED.code, 'Invalid token');
  }
  const findUser = await await user.findOne({
    where: { token },
  });
  return findUser.dataValues;
}
