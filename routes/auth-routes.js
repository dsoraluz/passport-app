const express = require('express');
//Bcrypt to encrypt passwords.
const bcrypt = require('bcrypt');
//Require statement for user-models
const User = require('../models/user-model.js');

const authRoutes = express.Router();

//Get route for signup
authRoutes.get('/signup',(req, res, next)=>{
  res.render('auth/signup-view.ejs');
});

//Post route for signup form submission
authRoutes.post('/signup',(req,res,next)=>{
  const username = req.body.username;
  const password = req.body.password;

  if (username === '' || password ===''){
    res.render('auth/signup-view.ejs', {
      errorMessage: 'Please fill out both username and password foo\'!'
    });
    return;
  }

  //Checks to see if user exists.//logic now resides in the callback function
  User.findOne({ username: username}, {usermame:1},(err,foundUser)=>{
    if(err){
      next(err);
      return;
    }
    //If the foundUser is not null (meaning it does have something),render
    // page with error message and early return.
    if(foundUser !== null){
      res.render('auth/signup-view.ejs', {
        errorMessage: 'The username already exists'
      });
      return;
    }
    // if username does not exist, continue with usercreation.
    const salt = bcrypt.genSaltSync(10);
    const hashPass = bcrypt.hashSync(password, salt);

    //create userinfo with hashed password
    const userInfo = {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      username: username,
      encryptedPassword: hashPass
    };
    //Create user object with user model using entered userInfo (username and password)
    const theUser = new User(userInfo);

    theUser.save((err)=>{
      if(err){
        res.render('auth/signup-view.ejs',{errorMessage: 'Oops! There was a problem saving. Try again later.'});
        return;
      }else{
        //can be whatever message (ok, okMessage, success)
        //          |
        req.flash('success','You have been registered. Try loggin in.');
        res.redirect('/');
      }

    });
  });
});
const passport = require('passport');

//Stays the same
// authRoutes.get('/login', (req,res,next)=>{
//   res.render('auth/login-view.ejs', {errorMessage: req.flash('error')});
// });




//changes..says that the authentication is done by passport and its using the
//local strategy
authRoutes.post("/login",
 passport.authenticate("local", {
  successReturnToOrRedirect: "/", //instead of successRediret (which takes you to home no matter where you were).. successReturnToOrRedirect takes you to the last page you were on.
  failureRedirect: "/login",
  failureFlash: true, //get flash messages from login fail.
  successFlash: 'You have been logged in, user', //get flash messages from login success
  passReqToCallback: true
}));

//Get route for logout
//simply destroys the session
//does not destroy the cookie
//it clears all the information associated with the session (ie. currentUser)
authRoutes.get('/logout',(req,res,next)=>{
  req.logout(); //Instead of destroy().. it now works for all different strategies (google,facebook,etc.)
  req.flash('success', 'You have logged out.');
    res.redirect('/');
});

//---------------- FACEBOOK PASSPORT ROUTES ---------------------
//Just need to declare, passport takes care of the routes in the background.
//We dont need to create and views that handle the routes or direct to them.
//Passport does it.
authRoutes.get("/auth/facebook", passport.authenticate("facebook"));
authRoutes.get("/auth/facebook/callback", passport.authenticate("facebook", {
  successRedirect: "/",
  failureRedirect: "/login"
}));

//---------------- GOOGLE+ PASSPORT ROUTES ---------------------

authRoutes.get("/auth/google", passport.authenticate("google", {
  scope: ["https://www.googleapis.com/auth/plus.login",
          "https://www.googleapis.com/auth/plus.profile.emails.read"]
}));

authRoutes.get("/auth/google/callback", passport.authenticate("google", {
  failureRedirect: "/",
  successRedirect: "/login"
}));


module.exports = authRoutes;
