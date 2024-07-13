const expres = require('express');
const router = expres.Router()

router.get('/',(req,res)=>
{
    res.render('./first-page/first-page');
})

module.exports = router;