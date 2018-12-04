require('dotenv').config();
const passport = require('passport');
const GitHubStrategy = require('passport-github').Strategy;

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
    // callbackURL: 'http://localhost:3000/login/github/callback'
  },
  function(accessToken, refreshToken, profile, cb){
    User.findOrCreate({ githubId: profile.id }, function (err, user) {
      return cb(null, user);
    });
  }
));
