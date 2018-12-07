require('dotenv').config();
const passport = require('passport');

const User = require('../models/userModel');

const JWTstrategy = require('passport-jwt').Strategy;
const ExtractJWT = require('passport-jwt').ExtractJwt;

//This verifies that the token sent by the user is valid
passport.use(new JWTstrategy({
  secretOrKey : process.env.SESSION_SECRET,
  jwtFromRequest : ExtractJWT.fromAuthHeaderAsBearerToken()
}, async (decoded_jwt, done) => {
  try {
    let user = await User.findByGitId(decoded_jwt.id);
    return done(null, user);
  } catch (error) {
    done(error);
  }
}));