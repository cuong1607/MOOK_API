require('dotenv').config();
const debug = require('debug')('app:crashlytics');
module.exports = (app) => {
  /**
   * [BEGIN] Setup Crashlytics
   */

  const Sentry = require('@sentry/node');

  SENTRY_RELEASE = `${process.env.npm_package_name}@${SENTRY_RELEASE}`;
  debug('sentry release', SENTRY_RELEASE);
  if (!['production', 'staging', 'testing', 'development'].includes(SENTRY_ENVIRONMENT)) {
    debug('development mode - no sentry');
    return (shouldHandleError) => (req, res, next) => {
      next();
    };
  }
  if (!SENTRY_DSN) {
    debug('no sentry config');
    return (shouldHandleError) => (req, res, next) => {
      next();
    };
  }
  Sentry.init({
    // dsn: 'https://7557add56b5048ca90201a2486b31d5d@o440093.ingest.sentry.io/5415718',
    dsn: SENTRY_DSN,
    // release: SENTRY_RELEASE,
    environment: SENTRY_ENVIRONMENT || process.env.NODE_ENV,
    integrations: [
      new Sentry.Integrations.Mysql(),
      // enable HTTP calls tracing
      new Sentry.Integrations.Http({ tracing: true }),
      // enable Express.js middleware tracing
      new Sentry.Integrations.Express({ app }),
      new Sentry.Integrations.RequestData({
        include: {
          data: true,
          headers: true,
          ip: true,
          query_string: true,
          url: true,
          user: true,
        },
      }),
    ],
    tracesSampleRate: parseFloat(SENTRY_TRACE_SAMPLE_RATE) || 0,
    tracesSampler: (samplingContext) => {
      if (
        samplingContext.transactionContext.name == 'GET /swagger-stats/metrics' ||
        samplingContext.transactionContext.name == 'PUT /user/online'
      ) {
        return 0;
      }
      if (samplingContext.parentSampled !== undefined) {
        return samplingContext.parentSampled;
      }
      return parseFloat(SENTRY_TRACE_SAMPLE_RATE) || 0;
    },
    ignoreErrors: [
      // Random plugins/extensions
      'top.GLOBALS',
      // See: http://blog.errorception.com/2012/03/tale-of-unfindable-js-error.html
      'originalCreateNotification',
      'canvas.contentDocument',
      'MyApp_RemoveAllHighlights',
      'http://tt.epicplay.com',
      "Can't find variable: ZiteReader",
      'jigsaw is not defined',
      'ComboSearch is not defined',
      'http://loading.retry.widdit.com/',
      'atomicFindClose',
      // Facebook borked
      'fb_xd_fragment',
      // ISP "optimizing" proxy - `Cache-Control: no-transform` seems to
      // reduce this. (thanks @acdha)
      // See http://stackoverflow.com/questions/4113268
      'bmi_SafeAddOnload',
      'EBCallBackMessageReceived',
      // See http://toolbar.conduit.com/Developer/HtmlAndGadget/Methods/JSInjection.aspx
      'conduitPage',
    ],
    denyUrls: [
      // Facebook flakiness
      /graph\.facebook\.com/i,
      // Facebook blocked
      /connect\.facebook\.net\/en_US\/all\.js/i,
      // Woopra flakiness
      /eatdifferent\.com\.woopra-ns\.com/i,
      /static\.woopra\.com\/js\/woopra\.js/i,
      // Chrome extensions
      /extensions\//i,
      /^chrome:\/\//i,
      // Other plugins
      /127\.0\.0\.1:4001\/isrunning/i, // Cacaoweb
      /webappstoolbarba\.texthelp\.com\//i,
      /metrics\.itunes\.apple\.com\.edgesuite\.net\//i,
    ],
  });
  // RequestHandler creates a separate execution context using domains, so that every
  // transaction/span/breadcrumb is attached to its own Hub instance
  app.use(Sentry.Handlers.requestHandler());
  // TracingHandler creates a trace for every incoming request
  app.use(Sentry.Handlers.tracingHandler());
  /* [END] CRASHLYTICS */

  return (shouldHandleError) => {
    return Sentry.Handlers.errorHandler({ shouldHandleError });
  };
};
