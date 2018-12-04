const express = require('express');


module.exports = function(passport){

  const router = express.Router();

  router.get('/github', passport.authenticate('github', (err, user, info) => {
    if(!user){ res.send(info.message); return;}
    req.login(user, error => {
      if (error) return next(error);
      console.log("Request Login supossedly successful.");
      return res.send('Login successful');
    })
  }));

  router.get('/github/callback',
    passport.authenticate('github', {successRedirect: '/api/auth/'})
    );

  router.get('/', (req, res, next) =>{
    res.send({user: req.user});
  });

  router.get('/logout', (req, res, next) => {
    req.logout();
    res.send({loggedOut: true})
  });

  return router

};