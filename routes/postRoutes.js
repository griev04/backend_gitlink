const express = require('express');
const router = express.Router();

const gh = require('../config/githubApi');

router.get('/currentUser', async (req, res, next) => {
  try{
    const user = req.user;
    let response = await gh(user.access_token).get(`/users/${user.login}/received_events`);
    res.json({posts: response.data});
  } catch(err){
    console.log(err);
    res.status(500).json({error: err.message});
    }
});

module.exports = router;