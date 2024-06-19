var express = require('express');
var router = express.Router();
var suserdb = require('../database/sUser-db')
var objectId = require('mongodb').ObjectId

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
router.get('/findbus',(req,res)=>
{
    res.render('./susers/search-bus',{suserhd: true})

})
router.post('/findbus',(req,res)=>
{
    req.body.from = req.body.from.toUpperCase()
    req.body.to = req.body.to.toUpperCase()
    console.log(req.body);
    suserdb.Find_Matching_Busess_Search_With_Placess(req.body).then((bus)=>
    {
        res.render('./susers/search-bus',{suserhd: true,bus})
    })
})
router.get('/busticket',(req,res)=>
{
    console.log(req.query.userid);
    suserdb.Get_Buse_info_Whe_User_Chose_a_BUS(req.query.id,req.query.userid).then((info)=>
    {
        res.render('./susers/bus-info',{suserhd: true,info})
    })
})

module.exports = router;
