module.exports = {
  authorizeMiddleware: require('./authorizeMiddleware'),
  authenticateMiddleware: require('./Authenticated'),
  pagingMiddleware: require('./pagingMiddleware'),
  // validateMiddleware: require('./validateMiddleware'),
  fileMiddleware: require('./uploadMiddleware'),
};
