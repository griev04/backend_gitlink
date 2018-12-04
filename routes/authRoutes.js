const express = require('express');


module.exports = function(passport){

  const router = express.Router();

  router.post('/github', passport.authenticate('github'));

  router.get('/github/callback',
    passport.authenticate('github',
    (req, res) => {
      console.log("Successfull authentification 🐳🐳🐳");
      // res.redirect(`/api/users/me`);
      res.json({user: req.user});
    }
  ));


  router.get('/logout', (req, res, next) => {
    req.logout();
    res.json({loggedOut: true})
  });

  return router

};