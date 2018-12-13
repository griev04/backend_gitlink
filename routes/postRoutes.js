const express = require("express");
const router = express.Router();
const Post = require("../models/PostModel");

const gh = require("../config/githubApi");



router.get("/currentUser", async (req, res, next) => {
  try {
    const user = req.user;
    let response = await gh(user.access_token).get(
      `/users/${user.login}/received_events?per_page=300`
    );

    let completeResponse = await Post.getFeedInteractions(response.data, user.id);

    res.json({ posts: completeResponse });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
});

router.post("/comments", async (req, res, next) => {
  try {
    const user = req.user;
    const { feedId, commentContent } = req.body;
    
    const result = Post.createComment(feedId, user, commentContent);
    
    res.json({result});
    
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
});

router.post("/handleLike", async (req, res, next) => {
  try {
    const user = req.user;
    const { feedId } = req.body;

    // Save new like to DB
    const result = Post.createLike(feedId, user);
    
    res.json({ result });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
