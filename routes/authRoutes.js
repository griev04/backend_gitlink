require('dotenv').config();
const express = require('express');
const jwt = require('jsonwebtoken');

const User = require('../models/userModel');
const gh = require('../config/githubApi');

module.exports = function(passport){

  const router = express.Router();

  /**
   * Logs in a new user - creates a jwt token and returns it
   * @param userDb : user object from the database
   * @param access_token : github access token
   * @return {Promise<{user: *, jwt_token: *}>}
   */
   async function login(userDb, access_token){

     // 1. update access token
    console.log(`login user ${userDb.id}`);
    userDb.access_token = access_token;

    // 2. create the jwt token
    const jwt_token = jwt.sign(
      { id: userDb.id, access_token: access_token },
      process.env.SESSION_SECRET
    );

    let user = await userDb.save();
    return {user, jwt_token}
  }

  /**
   * Signs up a new user given the data received from github api
   * @param userData
   */
  function signup(userData){
    console.log("creating new user "+userData.id);
    return User.create(userData)
  }

  router.post('/login', async (req, res, next) => {
    try{
      let access_token = req.body.token;

      // 1. get user data
      let userRequest = await gh.get('/user', {
        params: {access_token}
      });
      const userData = userRequest.data;
      console.log(`got user data for ${userData.id}`);

      // 2. check if user already exists
      let userDb = await User.findByGitId(userData.id);
      const userNotRegistered = (!userDb);
      console.log(`userNotRegistered : ${!userDb}`);

      // 3. if user not already registered, signup
      if(userNotRegistered){
        userDb = await signup(userData);
      }

      // in all cases, logs him in
      let {user, jwt_token} = await login(userDb, access_token);
      console.log(`new token for user ${user.id} is ${userDb.access_token} - jwt_token : ${jwt_token}`);

      res.json({jwt_token, id: user.id});

    } catch(err){
      console.log(err);
      res.json({error: err.message});
    }
  });

  router.post('/logout', (req, res, next) => {
    res.json({logout: true});
  });

  router.get('/failedAuth', (req, res, next) => {
    res.json({failedAuth: true});
  });


  return router
};


















  //
  //
  // /**
  //  * @api {get} /api/auth/github Logs in with a github account. In case of success, it is redirected to /api/users/current
  //  * @apiName Login
  //  * @apiGroup Authentification
  //  */
  // router.get('/github', passport.authenticate('github', (err, user, info) => {
  //   if(!user){ res.json({error: info.message}); return;}
  //   req.login(user, error => {
  //     if (error) return next(error);
  //     return res.send('logged in successfully');
  //   })
  // }));
  // router.get('/github/callback',
  //   passport.authenticate('github', {successRedirect: '/api/users/current'})
  // );
