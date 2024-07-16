var express = require('express');
var router = express.Router();
var puserdb = require('../database/pUser-db')
var objectId = require('mongodb').ObjectId
var dynamicinput = require('../connection/dynamic-input');

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
router.get("/proform", verifyPrimaryUser, (req, res) => {
  puserdb.Check_Whether_The_PRIMARY_USER_Already_REquested_OR_not(req.session.user._id).then((info) => {
    res.render('./users/pro-form', { userhd: true, puser: req.session.user, info })
  }).catch((ntg) => {
    res.render('./users/pro-form', { userhd: true, puser: req.session.user })
  })
})
router.post('/proform', verifyPrimaryUser, async (req, res) => {
  //console.log(req.body);
  req.body.available = parseInt(req.body.max)
  req.body.userId = objectId(req.session.user._id);
  req.body.isaccept = false;
  req.body.isbus = true;
  req.body.already = true;
  function convertAndRemoveNames(obj) {
    const nameArray = [];
    const numInputs = parseInt(obj.numInputs, 10);

    for (let i = 1; i <= numInputs; i++) {
      const key = `name${i}`;
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        nameArray.push({ [key]: obj[key].toUpperCase() });
        delete obj[key]; // Remove the property from the original object
      }
    }

    // Optionally, add the array of objects back to the original object
    obj.stops = nameArray;

    return obj;
  }
  await convertAndRemoveNames(req.body)
  await dynamicinput.Create_Dynamic_Inputs(req.body, "dis");
  await dynamicinput.Create_Dynamic_Inputs(req.body, "pri");

  console.log(req.body);
  puserdb.Inserty_Bus_AND_Stops_Details(req.body).then(() => {
    res.redirect('/proform')
  })

})
router.get('/addchecker', verifyPrimaryUser, (req, res) => {
  res.render('./users/checker-form', { userhd: true, puser: req.session.user })
})
router.post('/addchecker', verifyPrimaryUser, (req, res) => {
  req.body.userid = objectId(req.session.user._id)
  //console.log(req.body);
  puserdb.Insert_Checker_info_By_Primary_user(req.body).then(async (id) => {
    var image = req.files.image;
    if (image) {
      await image.mv(
        "public/checker-image/" + id + ".jpg",
        (err, data) => {
          if (err) {
            console.log(err);
          }
        }
      );
    }
    res.render('./users/checker-form', { userhd: true, puser: req.session.user, added: true })
  })
})
router.get('/viewchecker', verifyPrimaryUser, (req, res) => {
  puserdb.View_Their_Own_Checkers(req.session.user._id).then((checkers) => {
    console.log(checkers);
    res.render('./users/list-checkers', { userhd: true, puser: req.session.user, checkers })
  }).catch(() => {
    res.render('./users/list-checkers', { userhd: true, puser: req.session.user })
  })
})
router.get('/removechecker', (req, res) => {
  puserdb.REmove_their_Own_cHeckers(req.query.id).then(() => {
    res.redirect('/viewchecker')
  })
})
router.get('/viewbuss', verifyPrimaryUser, (req, res) => {
  puserdb.Get_User_added_Buss_Adnd__Its_Details(req.session.user._id).then((bus) => {
    console.log(bus);
    bus.map(async (i) => {
      var predate = i.edate;
      var today = new Date();

      var options = { timeZone: 'Asia/Kolkata', year: 'numeric', month: '2-digit', day: '2-digit' };
      var formatter = new Intl.DateTimeFormat('en-CA', options);

      var formattedToday = formatter.format(today);

      if (predate < formattedToday) {
        await puserdb.Enable_Permition_For_Edit(i._id).then(() => { })
      }
    })
    res.render('./users/view-bus', { userhd: true, puser: req.session.user, bus })
  })
})
router.get('/about', (req, res) => {
  return res.render('./users/about-page', { userhd: true, puser: req.session.user })
})
router.get('/editbus', verifyPrimaryUser, (req, res) => {
  puserdb.Get_Date_For_Edit(req.query.id).then((businfo) => {
    console.log(businfo);
    res.render('./users/edit-bus', { userhd: true, puser: req.session.user, businfo })
  })
})
router.post('/editbus', verifyPrimaryUser, async (req, res) => {
  req.body.available = parseInt(req.body.max)
  req.body.userId = objectId(req.session.user._id);
  req.body.isaccept = false;
  req.body.isbus = true;
  req.body.already = true;
  function convertAndRemoveNames(obj) {
    const nameArray = [];
    const numInputs = parseInt(obj.numInputs, 10);

    for (let i = 1; i <= numInputs; i++) {
      const key = `name${i}`;
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        nameArray.push({ [key]: obj[key].toUpperCase() });
        delete obj[key]; // Remove the property from the original object
      }
    }

    // Optionally, add the array of objects back to the original object
    obj.stops = nameArray;

    return obj;
  }
  await convertAndRemoveNames(req.body)
  await dynamicinput.Create_Dynamic_Inputs(req.body, "dis");
  await dynamicinput.Create_Dynamic_Inputs(req.body, "pri");
  console.log(req.body);
  puserdb.Update_Edited_information(req.query.id, req.body).then(() => {
    res.redirect('/proform')
  })

})
router.post('/emergency', (req, res) => {
  res.json({ id: req.body.id })
})
router.get('/emergency', (req, res) => {
  puserdb.Redrive_Bus_informtion_For_Emergency(req.query.id).then((businfo) => {
    console.log(businfo);
    res.render('./users/emergency-page', { userhd: true, puser: req.session.user, businfo })
  })
})
router.post('/emergencyform', verifyPrimaryUser, (req, res) => {
  puserdb.Emergency_Object_Information_SetUp(req.query.id, req.body).then(() => {
    puserdb.Redrive_Bus_informtion_For_Emergency(req.query.id).then((businfo) => {
      puserdb.Update_Emergence_Date_TO_Notuse(req.query.id, req.body.date).then(() => {
        res.render('./users/emergency-page', { userhd: true, puser: req.session.user, businfo, succ: true })
      })
    })
  })
})

module.exports = router;
