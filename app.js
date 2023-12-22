require('module-alias/register');
var createError = require('http-errors');
const sequelize = require('sequelize');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const cors = require('cors');
const bodyParser = require('body-parser');
const compression = require('compression');

// define router
var indexRouter = require('./src/routes/index');
var usersRouter = require('./src/routes/usersRoutes');
var userSessionRouter = require('@routes/usersSessionRoutes');
const categoryRouter = require('@routes/categoryRoutes');
const productRouter = require('@routes/productRoutes');
const orderRouter = require('@routes/orderRoutes');
const sizeRouter = require('@routes/sizeRoutes');
const colorRouter = require('@routes/colorRoutes');
const priceRouter = require('@routes/priceRoutes');
const cartRouter = require('@routes/cartRoutes');
const fileRouter = require('@routes/fileRoutes');
const adminOrderRouter = require('@routes/adminOrderRoutes');
const storageRouter = require('@routes/storageRoutes');
const branchRouter = require('@routes/branchRoutes');
const productPriceRouter = require('@routes/productPriceRoutes');
const provinceRouter = require('@routes/provinceRoutes');
const districtRouter = require('@routes/districtRoutes');
const wardRouter = require('@routes/wardRoutes');
const overviewRouter = require('@routes/overviewRoutes');

const db = require('./src/models/index');
var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static('uploads'));

app.use(cors());
app.use(compression());
app.use(logger('combined'));
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(cookieParser());
app.use('/', indexRouter);
app.use('/user', usersRouter);
app.use('/user-session', userSessionRouter);
app.use('/category', categoryRouter);
app.use('/product', productRouter);
app.use('/order', orderRouter);
app.use('/size', sizeRouter);
app.use('/color', colorRouter);
app.use('/price', priceRouter);
app.use('/cart', cartRouter);
app.use('/upload', fileRouter);
app.use('/admin-order', adminOrderRouter);
app.use('/storage', storageRouter);
app.use('/branch', branchRouter);
app.use('/product-price', productPriceRouter);
app.use('/province', provinceRouter);
app.use('/district', districtRouter);
app.use('/ward', wardRouter);
app.use('/overview', overviewRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

db.sequelize
  .sync()
  .then(() => {
    console.log('Connect database successfully');
  })
  .catch((err) => {
    console.log('Failed to sync db: ' + err.message);
  });

const { AppError, apiCode } = require('./src/utils/constant');

app.use((error) => {
  if (!(error instanceof AppError)) {
    return true;
  }
  if (error?.code == 403) {
    return false;
  }
  return true;
});
const response = require('@src/common/response');
// error handler
app.use(function (err, req, res, next) {
  res.status((err?.isUseStatus && err.status) || 200);
  if (err instanceof sequelize.BaseError) {
    return res.json(response.error(err, null, app.get('env') === 'development' ? err.stack : ''));
  }
  // render the error page
  res.json(response.error(err, null, app.get('env') === 'development' ? err.stack : ''));
});

module.exports = app;
