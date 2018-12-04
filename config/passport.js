require('dotenv').config();
const passport = require('passport');
const GitHubStrategy = require('passport-github').Strategy;

const User = require('../models/userModel');

passport.serializeUser(function (user, done) {
  console.log("🦕🦕🦕🦕🦕🦕 SERIALIZING USER");
  console.log(user);
  done(null, user.id);
});

passport.deserializeUser(function (id, done) {
  User.findOne({id}, function (err, user) {
    console.log("🦖🦖🦖🦖🦖🦖🦖🦖🦖🦖 DESERIALIZING USER ");
    console.log(user);
    done(err, user);
  });
});

passport.use(new GitHubStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: '/api/auth/github/callback'
  },
  async function(accessToken, refreshToken, profile, cb){
    try{

      let user = await User.findOne({id: profile._json.id});
      if(!user){
        user = await User.create(profile._json);
      }
      console.log("🐯🐯🐯🐯🐯🐯🐯🐯🐯🐯🐯");
      console.log(user.login);
      cb(null, user);
    } catch (err){
      console.log("💩💩💩💩💩💩💩 ");
      console.log(err.message);
    }
  }
));
