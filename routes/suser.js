var express = require('express');
var router = express.Router();
var suserdb = require('../database/sUser-db')
var objectId = require('mongodb').ObjectId
var qrcode = require('../public/javascripts/qrcode')

function verifySecondaryUser(req, res, next) {
    if (req.session.suser) {
        next()
    }
    else {
        res.redirect('/suser/login')
    }
}

router.get('/', function (req, res, next) {
    if (req.session.suser) {
        //console.log(req.session.suser);
        res.render('./susers/first-page', { suserhd: true, suser: req.session.suser })
    }
    else {
        res.render('./susers/first-page', { suserhd: true })
    }
});
router.get('/signup', (req, res) => {
    res.render('./susers/signup-page')
})
router.post('/signup', (req, res) => {
    console.log(req.body);
    suserdb.Do_Secondary_user_signup(req.body).then((id) => {
        res.redirect('/suser/login')
    })
})
router.get('/login', (req, res) => {
    if (req.session.suser) {
        res.redirect('/suser')
    }
    else {
        if (req.session.sfailed) {

            res.render('./susers/login-page', { logerr: true })
            req.session.sfailed = false
        }
        else {
            res.render('./susers/login-page')
        }
    }

})
router.post('/login', (req, res) => {
    suserdb.Do_Secondary_User_Login(req.body).then((resc) => {

        req.session.suser = { ...resc };
        req.session.suser.status = true;
        res.redirect('/suser')
    }).catch(() => {
        req.session.sfailed = true;
        res.redirect('/suser/login')

    })
})
router.get('/logout', (req, res) => {
    req.session.suser = null;
    res.redirect('/suser/login')
})
router.get('/findbus', verifySecondaryUser, (req, res) => {
    res.render('./susers/search-bus', { suserhd: true, suser: req.session.suser })

})
router.post('/findbus', (req, res) => {
    req.body.from = req.body.from.toUpperCase()
    req.body.to = req.body.to.toUpperCase()
    console.log(req.body);
    suserdb.Find_Matching_Busess_Search_With_Placess(req.body).then((bus) => {
        console.log(bus);
        res.render('./susers/search-bus', { suserhd: true, bus, suser: req.session.suser })
    })
})
router.get('/busticket', (req, res) => {
    console.log(req.query.userid);
    suserdb.Get_Buse_info_Whe_User_Chose_a_BUS(req.query.id, req.query.userid).then((info) => {
        res.render('./susers/bus-info', { suserhd: true, info, suser: req.session.suser })
    })
})
router.post('/buspay', (req, res) => {
    req.body.suserid = objectId(req.session.suser._id);
    req.body.puser = objectId(req.body.puser)
    req.body.isvalidated = false;
    req.body.date = new Date()
    req.body.id = objectId(req.body.id)
    suserdb.Insert_Secndary_User_Payment_Details(req.body).then(async (id) => {

        await qrcode.GenerateOrder_Qr_Code(id).then((data) => {
            suserdb.generateRazorpay(id, req.body.total).then((response) => {
                response.tkno = req.body.tkno;
                response.busid = req.body.id
                console.log(response);
                res.json(response)
            })
        })
    })
})
router.post('/verfy-pay', (req, res) => {
    console.log("findWork ID", req.body);
    suserdb.verify_Payment(req.body).then(() => {
        suserdb.Update_available_Seats_When_User_paceed_ticket(req.body['order[busid]'], parseInt(req.body['order[tkno]']))
        res.json({ status: true })
    }).catch(() => {
        res.json({ status: 'Payment Failed' })
    })
})
router.get('/viewtickets',verifySecondaryUser, (req, res) => {
    suserdb.Show_Users_Purchased_Tickets(req.session.suser._id).then(tickets => {
        console.log(tickets);
        res.render('./susers/view-tickets', { suserhd: true, suser: req.session.suser, tickets })
    })
})

module.exports = router;
