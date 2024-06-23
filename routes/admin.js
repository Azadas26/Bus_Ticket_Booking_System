var express = require('express');
var router = express.Router();
var admindb = require('../database/admin-db')


function varifyAdminLogin(req,res,next)
{
  if(req.session.admin)
    {
      next()
    }
    else
    {
      res.redirect('/admin/login')
    }
}

router.get('/', varifyAdminLogin,function (req, res, next) {
  res.render('./admin/first-page', { admin:true,adminhd: true })
});
router.get('/login', (req, res) => {
  if (req.session.adminfailed) {

    res.render('./admin/login-page', { logerr: true })
    req.session.adminfailed = false
  }
  else {
    res.render('./admin/login-page')

  }
})
router.post('/login', (req, res) => {
  console.log(req.body);
  admindb.Do_Checker_admin_Login(req.body).then((resc) => {

    req.session.admin = { ...resc };
    req.session.admin.status = true;
    res.redirect('/admin')
  }).catch(() => {
    req.session.adminfailed = true;
    res.redirect('/admin/login')

  })
})
router.get('/logout', (req, res) => {
  req.session.cuser = null;
  res.redirect('/admin/login')
})
router.get('/busrequest',varifyAdminLogin, (req, res) => {
  admindb.Accept_PriMary_User_BUS_rEquEst().then((buss) => {
    res.render('./admin/bus-request', { adminhd: true, admin: true, buss })
  }).catch(() => {
    res.render('./admin/bus-request', { adminhd: true, admin: true })
  })
})
router.get('/acceptbus', varifyAdminLogin,(req, res) => {
  admindb.Update_Isrequest_When_after_admin_accept(req.query.id).then(() => {
    res.redirect('/admin/busrequest')
  })
})
router.get('/removebus',varifyAdminLogin, (req, res) => {
  admindb.Delete_Admin_REmoved_Busss(req.query.id).then(() => {
    res.redirect('/admin/busrequest')
  })
})

module.exports = router;
