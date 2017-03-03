const express      = require('express');
const path         = require('path');
const favicon      = require('serve-favicon');
const logger       = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser   = require('body-parser');
const layouts      = require('express-ejs-layouts');
const mongoose     = require('mongoose');
//---------- Needed for Passport.js. -----
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const FbStrategy = require('passport-facebook').Strategy;
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
const bcrypt = require('bcrypt');
const flash = require('connect-flash');

//-------------LOADS .env FILE----------------
//DotENV does the work to make sure the env file is recognized even though it is in .gitignore.
const dotenv = require('dotenv');

const User = require('./models/user-model.js');
//-------------------------------------------

//Starts dotenv
dotenv.config();
mongoose.connect(process.env.MONGODB_URI);
// mongoose.connect('mongodb://localhost/passport-app');

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// default value for title local
app.locals.title = 'Express - Generated with IronGenerator';

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(layouts);

//---------------------- PASSPORT ----------------------------------------------
app.use(session({
  secret: "our-passport-local-strategy-app",
  resave: true,
  saveUninitialized: true
}));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

//Local strategy - authentication is comming from internal check of records.
passport.use(new LocalStrategy((username, password, next) => {
  //Check first if the database has an entry with that username.
  User.findOne({ username }, (err, user) => {
    if (err) {
      return next(err);
    }
    //if user exists (fail) (authentication failed)--(error message)
    else if (!user) {
      return next(null, false, { message: "Incorrect username" });
    }//If password does not match
    else if (!bcrypt.compareSync(password, user.encryptedPassword)) {
      return next(null, false, { message: "Incorrect password" });
    }else{
      //Retutn the user that we found.
      next(null, user);
    }

  });
}));

passport.use(new FbStrategy({
  clientID: process.env.FB_CLIENT_ID,       //The AppID from facebook
  clientSecret: process.env.FB_CLIENT_SECRET,   //The App Secret from Facebook
  callbackURL: process.env.HOST_ADDRESS + '/auth/facebook/callback' //The place you want the user to come back to after coming back from facebook
},(accessToken, refreshToken, profile, done)=>{ //when facebook returns successful with the credentials
  done(null,profile); //Handle the profile... comes back as an object.. which passport always organizes into a structure for us
//The provider we used to authenticate the user (facebook, gmail, github…).
// -- A unique id for each user generated by the service provider.
// -- The displayName of this user.
// -- The different emails associated to the accounts. It contains an array of emails, so we will have to choose which one we want to use.
// -- An array of photos of the user, that we can use to generate a more customized layout in our platform.
}));

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.HOST_ADDRESS + '/auth/google/callback'
}, (accessToken, refreshToken, profile, next) => {
  return next(null, profile);
}));

//In your session you want to minimize the amount of info stored
//instead of storing all info of user, we store unique things about
//them (user.id)..
//Serialize = take the user object and just associate that to the user id.
//Kind of makes a key (user id) to value (user object)
////cb is callback in passport
passport.serializeUser((user, cb) => {
  if(user.provider){
    //Need to save all user info if using facebook or other OAuth because we cant cross reference it with our own data.
    cb(null,user);
  }else{
    cb(null, user._id);
  }
});

//Takes the user id and deserializes it.. Takes user id and returns the
//corresponding user object.
passport.deserializeUser((id, cb) => {
//If using facbook or other OAuth, you cannot reference user data if it is not saved, so cross reference from it with facebook.
//Usually we would say users profile to database but lesson did not.
  if(id.provider){
    cb(null,id);
    return;
  }
  User.findOne({ "_id": id }, (err, user) => {
    if (err) { return cb(err); }
    cb(null, user);
  });
});
//------------------------------------------------------------------------------


//----------------------- ROUTES GO HERE ------------------
const index = require('./routes/index');
const authRoutes = require('./routes/auth-routes');
const protRoutes = require('./routes/protected-routes');
const roomsRoutes = require('./routes/rooms-routes');
app.use('/', index);
app.use('/', authRoutes);
app.use('/', protRoutes);
app.use('/', roomsRoutes);
//---------------------------------------------------------



// catch 404 and forward to error handler
app.use((req, res, next) => {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use((err, req, res, next) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
