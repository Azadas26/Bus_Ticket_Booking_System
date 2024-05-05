var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('./users/first-page',{user:true})
});

module.exports = router;
