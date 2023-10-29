var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
  res.json({ success: true, data: { message: 'welcome to MOOK api' } });
});

module.exports = router;
