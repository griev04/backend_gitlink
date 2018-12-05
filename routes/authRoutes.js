const express = require('express');


module.exports = function(passport){

  const router = express.Router();

    /**
   * @api {get} /api/auth/github Logs in with a github account. In case of success, it is redirected to /api/users/current
   * @apiName Login
   * @apiGroup Authentification
   */
  router.get('/github', passport.authenticate('github', (err, user, info) => {
    if(!user){ res.json({error: info.message}); return;}
    req.login(user, error => {
      if (error) return next(error);
      return res.send('logged in successfully');
    })
  }));
  router.get('/github/callback',
    passport.authenticate('github', {successRedirect: '/api/users/current'})
  );

  /**
   * @api {post} /api/auth/logout Logout the current user.
   * @apiName Logout
   * @apiGroup Authentification
   *
   * @apiSuccess {Boolean} loggedOut returns true if user logged out
   * @apiSuccess {String} id Github id of the user logged out
   * @apiSuccess {String} login login name of the user logged out
   *
   * @apiSuccessExample Success-Response:
   *     HTTP/1.1 200 OK
   *     {
   *       "loggedOut": "true",
   *       "id": "125900",
   *       "login": "octocat"
   *     }
   *
   *
   * @apiError LogoutError Error while logging out the current user.
   *
   * @apiErrorExample Error-Response:
   *     HTTP/1.1 404 Not Found
   *     {
   *       "error": "LogoutError",
   *       "loggedOut": "false"
   *     }
   */
  router.post('/logout', (req, res, next) => {
    const {login, id} = req.user;
    // req.logOut is not reliable ..
    // check https://stackoverflow.com/a/19132999/6744511
    req.session.destroy(function (err) {
      if (err) {return {error: err.message, loggedOut:false}}
      res.json({loggedOut: true, login, id})
    });

  });

  return router

};