var express = require('express');
var router = express.Router();
var puserdb = require('../database/pUser-db')

function verifyPrimaryUser(req, res, next) {
  if (req.session.user) {
    next()
  }
  else {
    res.redirect('/login')
  }
}

/* GET home page. */
router.get('/', function (req, res, next) {
  if (req.session.user) {
    console.log(req.session.user);
    res.render('./users/first-page', { userhd: true, puser: req.session.user })
  }
  else {
    res.render('./users/first-page', { userhd: true })
  }
});
router.get('/signup', (req, res) => {
  res.render('./users/signup-page')
})
router.post('/signup', (req, res) => {
  console.log(req.body);
  puserdb.Do_Primary_user_signup(req.body).then((id) => {
    res.redirect('/login')
  })
})
router.get('/login', (req, res) => {
  if (req.session.user) {
    res.redirect('/')
  }
  else {
    if (req.session.failed) {

      res.render('./users/login-page', { logerr: true })
      req.session.failed = false
    }
    else {
      res.render('./users/login-page')
    }
  }

})
router.post('/login', (req, res) => {
  puserdb.Do_Primary_User_Login(req.body).then((resc) => {

    req.session.user = { ...resc };
    req.session.user.status = true;
    res.redirect('/')
  }).catch(() => {
    req.session.failed = true;
    res.redirect('/login')

  })
})
router.get('/logout', (req, res) => {
  req.session.user = null;
  res.redirect('/login')
})
router.get("/proform", (req, res) => {
  res.render('./users/pro-form', { userhd: true, puser: req.session.user })
})
router.post('/proform', (req, res) => {
  console.log(req.body);
})

module.exports = router;
