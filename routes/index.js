const express = require('express');
const router  = express.Router();

/* GET home page. */
router.get('/', (req, res, next) => {
  res.render('index',{
    successMessage: req.flash('success'),
    userInfo: req.user
  });

});

router.get('/login', (req,res,next)=>{
  res.render('auth/login-view.ejs', {errorMessage: req.flash('error')});
});

module.exports = router;
