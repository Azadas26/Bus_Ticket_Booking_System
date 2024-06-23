const express = require('express');
const router = express.Router();
const checkerdb = require('../database/checker-db');
const e = require('express');

function verrifyChecker(req, res, next) {
    if (req.session.cuser) {
        next()
    }
    else {
        res.redirect('/checker/login')
    }
}

router.get('/', verrifyChecker, (req, res) => {
    console.log(req.session.cuser);
    res.render('./checker/first-page', { checkerhd: true, checker: req.session.cuser })
})
router.get('/login', (req, res) => {

    if (req.session.cfailed) {

        res.render('./checker/login-page', { logerr: true })
        req.session.cfailed = false
    }
    else {
        res.render('./checker/login-page')

    }

})
router.post('/login', (req, res) => {
    console.log(req.body);
    checkerdb.Do_Checker_User_Login(req.body).then((resc) => {

        req.session.cuser = { ...resc };
        req.session.cuser.status = true;
        res.redirect('/checker')
    }).catch(() => {
        req.session.cfailed = true;
        res.redirect('/checker/login')

    })
})
router.get('/logout', (req, res) => {
    req.session.cuser = null;
    res.redirect('/checker/login')
})
router.get('/busticket', verrifyChecker, (req, res) => {
    //console.log(req.session.cuser);
    checkerdb.Qr_Code_scann_and_Verify_User_BUS_ticket(req.query.id, req.session.cuser.userid).then((details) => {
        // console.log(details);
        if (details.length != 0) {
            res.render('./checker/after-scan', { checkerhd: true, checker: req.session.cuser, details })
        }
        else {
            res.render('./checker/after-scan', { checkerhd: true, checker: req.session.cuser, noperm: true })
        }

    })
})
router.get('/verifybusticket', verrifyChecker, (req, res) => {
    checkerdb.Ticket_Verification_AND_Change_Verifyed_STAte(req.query.id).then(() => {
        res.redirect(`/checker/busticket?id=${req.query.id}`);
    })
})
router.get('/bushistory', verrifyChecker, (req, res) => {
    checkerdb.Get_all_Verified_Bus_ticket_TO_Shoe_History(req.session.cuser.userid).then((details) => {
        res.render('./checker/busticket-history', { checkerhd: true, checker: req.session.cuser,details})
    })
})

module.exports = router;