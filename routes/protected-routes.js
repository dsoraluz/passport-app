const express = require('express');
//Checks to see if user is logged in to display protected content.
// Look up documentation for customization.. (default is redirect to login)
const ensureLogin = require('connect-ensure-login');
const protRoutes = express.Router();


//Caveats, needs to be there everytime.
//Better achieved with package connect-ensure-login
// function needsLogin (req, res, next) {
//   if(req.user){
//     next();
//   }else{
//     res.redirect('/login');
//   }
// }

protRoutes.get('/secret',ensureLogin.ensureLoggedIn(),(req,res,next)=>{
  res.send("SHHHHHHH its a secret");
});
protRoutes.get('/kgb-files',ensureLogin.ensureLoggedIn(), (req,res,next)=>{
  res.send('In Soviet Russia, files store you.');
});

module.exports = protRoutes;
