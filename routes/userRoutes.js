const express = require("express");
const router = express.Router();

const User = require("../models/userModel");
const gh = require("../config/githubApi");

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
router.get("/current", async (req, res, next) => {
  // TODO: this is just a demo and will certainly by changed
  // 1. get user data
  let userRequest = await gh(req.user.access_token).get("/user");
  let user = userRequest.data;

  if (!user) {
    res.json({ user: null });
    return;
  }
  res.json({ user });
});

/**
 * @api {get} /user/:login Get User information
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

router.get("/:login", async (req, res, next) => {
  try {
    // get otherprofile information
    const { login } = req.params;
    const response = await gh(req.user.access_token).get(`/users/${login}`);
    res.json({otherUser: response.data});
  }
  catch(err){
    console.log(err);
    res.status(500).json({error: err.message});
    }
});

module.exports = router;