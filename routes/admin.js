var express = require('express');
var router = express.Router();
var admindb = require('../database/admin-db')


function varifyAdminLogin(req, res, next) {
  if (req.session.admin) {
    next()
  }
  else {
    res.redirect('/admin/login')
  }
}

router.get('/', varifyAdminLogin, function (req, res, next) {
  res.render('./admin/first-page', { admin: true, adminhd: true })
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
router.get('/busrequest', varifyAdminLogin, (req, res) => {
  admindb.Accept_PriMary_User_BUS_rEquEst().then((buss) => {
    res.render('./admin/bus-request', { adminhd: true, admin: true, buss })
  }).catch(() => {
    res.render('./admin/bus-request', { adminhd: true, admin: true })
  })
})
router.get('/acceptbus', varifyAdminLogin, (req, res) => {
  admindb.Update_Isrequest_When_after_admin_accept(req.query.id).then(() => {
    res.redirect('/admin/busrequest')
  })
})
router.get('/removebus', varifyAdminLogin, (req, res) => {
  admindb.Delete_Admin_REmoved_Busss(req.query.id).then(() => {
    res.redirect('/admin/busrequest')
  })
})
router.get('/viewpuser', varifyAdminLogin, (req, res) => {
  //console.log(":hello");
  admindb.View_Primary_Users().then((users) => {
    console.log(users);
    res.render('./admin/view-puser', { users, adminhd: true, admin: true, length: users.length })
  })
})
router.get('/viewsuser', varifyAdminLogin, (req, res) => {

  admindb.View_Secondary_Users().then((users) => {
    console.log(users);
    res.render('./admin/view-suser', { users, adminhd: true, admin: true })
  })
})
router.get('/viewbus', varifyAdminLogin, (req, res) => {
  admindb.View_all_Bus_DEtails().then((buss) => {
    res.render('./admin/view-bus', { buss, adminhd: true, admin: true })
  })
})
router.get('/inactivate', varifyAdminLogin, (req, res) => {
  console.log(req.query.id);
  admindb.DEsable_inactivate_Option(req.query.id).then(() => {
    admindb.WenInactive_also_desable_Isaccept(req.query.id).then(() => {

      res.redirect('/admin/viewpuser')
    })
  })
})
router.get('/activate', varifyAdminLogin, (req, res) => {
  console.log("active", req.query.id);
  admindb.Enable_inactivate_Option(req.query.id).then(() => {
    admindb.Wenactive_also_enable_Isaccept(req.query.id).then(() => {

      res.redirect('/admin/viewpuser')
    })
  })
})
router.post('/emergencybusinfo', (req, res) => {
  admindb.Get_Owner_bus_info_Basses_Own_Emergency(req.body.id).then((info) => {
    console.log(info);
    info.map((i) => {
      if (!i.dateArray) {
        i.dateArray = []
      }
    })
    res.json(info)
  })
})
router.get('/report', varifyAdminLogin, (req, res) => {
  res.render('./admin/report-page', { adminhd: true, admin: true, userid: req.query.id, busid: req.query.busid })
})
router.post('/reportform', varifyAdminLogin, (req, res) => {
  req.body.isnotview = true;
  admindb.Report_Problem_TO_Customer(req.query.userid, req.query.busid, req.body).then(() => {

    res.render('./admin/report-page', { adminhd: true, admin: true, userid: req.query.id, busid: req.query.busid, success: true })
  })
})
router.get('/chat', varifyAdminLogin, (req, res) => {
  admindb.Get_Messaging_wners().then((chatinfo) => {
    res.render('./admin/chat-page', { adminhd: true, admin: true, chatinfo })
  })
})
router.post('/getownerchats', (req, res) => {
  //console.log(req.body.id);
  admindb.Get_Single_Owner_cHats(req.body.id).then((chat) => {
    admindb.Desable_NotificationCount(req.body.id).then(() => {
      console.log(chat);
      res.json({ chat })
    })
  })
})
router.post('/adminchat', (req, res) => {
  console.log(req.body);
  admindb.Replay_Message_To_wner(req.body.id,req.body.chat).then(() => {
    res.json({ status: true })
  })
})

module.exports = router;
