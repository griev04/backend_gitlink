require('dotenv').config();
const express = require('express');
const jwt = require('jsonwebtoken');

const User = require('../models/UserModel');
const gh = require('../config/githubApi');

module.exports = function(passport){

  const router = express.Router();

  /**
   * Logs in a new user - creates a jwt token and returns it
   * @param userDb : user object from the database
   * @param access_token : github access token
   * @return {Promise<{user: *, jwt_token: *}>}
   */
   async function logIn(userDb, access_token){

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

  /**
  * @api {post} /api/auth/login Logs in a user - create new profile if does not exist
  * @apiName Login
  * @apiGroup Authentification
  *
  * @apiParam {String} access_token github Oauth access token of the user
  *
  * @apiSuccess {String} jwt_token new generated jwt token for the user
  * @apiSuccess {String} id Github id of the user
  *
  * @apiSuccessExample Success-Response:
  *     HTTP/1.1 200 OK
  *     {
  *       "jwt_token": "jhbzqlfjbqsljnizqjnfklqjsnvlkzjenfkJNKJB",
  *       "id": "989864"
  *     }
  *
  * @apiError FailedLogin Could not login the user
  */
  router.post('/login', async (req, res, next) => {
    try{
      let {access_token} = req.body;

      // 1. get user data
      let userRequest = await gh(access_token).get('/user');
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

      // 4. in all cases, logs him in
      let {user, jwt_token} = await logIn(userDb, access_token);
      console.log(`new token for user ${user.id} is ${userDb.access_token} - jwt_token : ${jwt_token}`);

      // 5. send reposne to client
      res.json({jwt_token, id: user.id, login: user.login});

    } catch(err){
      console.log(err);
      res.json({error: err.message});
    }
  });


  router.post('/logout', (req, res, next) => {
    res.json({logout: true});
  });

  router.get('/failedAuth', (req, res, next) => {
    res.status(401).json({failedAuth: true});
  });

  return router
};
