const express = require("express");
const router = express.Router();
const Post = require("../models/PostModel");
const User = require("../models/UserModel");

const gh = require("../config/githubApi");



router.get("/currentUser", async (req, res, next) => {
  try {
    const user = req.user;
    let response = await gh(user.access_token).get(
      `/users/${user.login}/received_events`
    );

    let completeResponse = await Post.getFeedInteractions(response.data, user.id);

    res.json({ posts: completeResponse });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
});

router.post("/comment", async (req, res, next) => {
  try {
    const user = req.user;
    const { feedId, feedEvent, commentContent } = req.body;
   
    // create and save comment and notification
    let result;
    if (User.findOneByLogin(feedEvent.repo.name.split("/").slice(0, 1))){
      result = Post.createComment(feedId, feedEvent, user, commentContent);
    }
    res.json({result});
    
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
});

router.post("/like", async (req, res, next) => {
  try {
    const user = req.user;
    const { feedId, feedEvent } = req.body;

    // Create and save like and notification
    let result;
    if (User.findOneByLogin(feedEvent.repo.name.split("/").slice(0, 1))){
      result = Post.createLike(feedId, feedEvent, user);
    }
    
    res.json({ result });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
