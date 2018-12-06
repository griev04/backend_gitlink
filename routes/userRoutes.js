const express = require('express');
const router = express.Router();

const User = require('../models/userModel');
const gh = require('../config/githubApi');

/**
 * @api {get} /user/current Get the current User information
 * @apiName GetCurrentUser
 * @apiGroup User
 *
 * @apiSuccess {String} _id  internal database id
 * @apiSuccess {String} id  github id
 * @apiSuccess {String} access_token  github Oauth access token
 * @apiSuccess {String} login  username
 * @apiSuccess {String} avatar_url
 * @apiSuccess {String} url
 * @apiSuccess {String} html_url
 * @apiSuccess {String} followers_url
 * @apiSuccess {String} following_url
 * @apiSuccess {String} gists_url
 * @apiSuccess {String} starred_url
 * @apiSuccess {String} subscriptions_url
 * @apiSuccess {String} organizations_url
 * @apiSuccess {String} repos_url
 * @apiSuccess {String} events_url
 * @apiSuccess {String} received_events_url
 * @apiSuccess {String} type
 * @apiSuccess {String} site_admin
 * @apiSuccess {String} name
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *      'user': {
 *                "firstname": "John", // TODO : replace this with a postman answer
 *                "lastname": "Doe"
 *              }
 *     }
 *
 * @apiError UserNotLoggedIn No user is logged in
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "user": "null"
 *     }
 */
router.get('/current', async (req, res, next) => {

  // 1. get user data
  let userRequest = await gh.get('/user', {
    params: {access_token : req.user.access_token}
  });

  let user = userRequest.data;

  if (!user){res.json({user: null}); return;}
  res.json({user});
});

/**
 * @api {get} /user/:id Get User information
 * @apiName GetUser
 * @apiGroup User
 *
 * @apiParam {Number} id Users *GITHUB* ID.
 *
 * @apiSuccess {String} _id  internal database id
 * @apiSuccess {String} id  github id
 * @apiSuccess {String} access_token  github Oauth access token
 * @apiSuccess {String} login  username
 * @apiSuccess {String} avatar_url
 * @apiSuccess {String} url
 * @apiSuccess {String} html_url
 * @apiSuccess {String} followers_url
 * @apiSuccess {String} following_url
 * @apiSuccess {String} gists_url
 * @apiSuccess {String} starred_url
 * @apiSuccess {String} subscriptions_url
 * @apiSuccess {String} organizations_url
 * @apiSuccess {String} repos_url
 * @apiSuccess {String} events_url
 * @apiSuccess {String} received_events_url
 * @apiSuccess {String} type
 * @apiSuccess {String} site_admin
 * @apiSuccess {String} name
 */
router.get('/:id', async (req, res, next) => {
  try{
    const {id} = req.params;
    const user = await User.findByGitId(id);
    if(!user){
      console.log(`user with id ${id} not found in the database`);
      res.json({user: null});
    }
    res.json({user});
  } catch(err){
    console.log(err);
    next(err);
  }
});

module.exports = router;