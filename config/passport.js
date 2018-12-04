require('dotenv').config();
const passport = require('passport');
const GitHubStrategy = require('passport-github').Strategy;

const User = require('../models/userModel');

passport.serializeUser(function (user, done) {
  done(null, user.id);
});

passport.deserializeUser(function (id, done) {
  User.findById(id, function (err, user) {
      done(err, user);
  });
});

passport.use(new GitHubStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: '/api/auth/github/callback'
  },
  function(accessToken, refreshToken, profile, cb){
    User.findOrCreate(profile, function (err, user) {
      return cb(null, user);
    });
  }
));
