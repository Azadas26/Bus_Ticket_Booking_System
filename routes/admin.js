var express = require('express');
var router = express.Router();
var admindb = require('../database/admin-db')

/* GET users listing. */
router.get('/', function (req, res, next) {
  res.render('./admin/first-page', { adminhd: true })
});
router.get('/busrequest', (req, res) => {
  admindb.Accept_PriMary_User_BUS_rEquEst().then((buss) => {
    res.render('./admin/bus-request', { adminhd: true, admin: true, buss })
  }).catch(() => {
    res.render('./admin/bus-request', { adminhd: true, admin: true })
  })
})
router.get('/acceptbus', (req, res) => {
  admindb.Update_Isrequest_When_after_admin_accept(req.query.id).then(() => {
    res.redirect('/admin/busrequest')
  })
})
router.get('/removebus', (req, res) => {
  admindb.Delete_Admin_REmoved_Busss(req.query.id).then(() => {
    res.redirect('/admin/busrequest')
  })
})

module.exports = router;
