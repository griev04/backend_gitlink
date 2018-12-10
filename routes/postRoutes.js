const express = require("express");
const router = express.Router();
const Post = require("../models/PostModel");

const gh = require("../config/githubApi");

async function getFeedInteractions(feedArray) {
  let searchArray = feedArray.map(post => post.id);
  let socialFeed = await Post.findByGitIds(searchArray);
  console.log(socialFeed);
  let completeFeed = feedArray.map(feedItem => ({
    ...feedItem,
    ...socialFeed.find(socialItem => socialItem.id === feedItem.id && socialItem)
  }));

  return completeFeed;
}

router.get("/currentUser", async (req, res, next) => {
  try {
    const user = req.user;
    let response = await gh(user.access_token).get(
      `/users/${user.login}/received_events`
    );

    let completeResponse = await getFeedInteractions(response.data);
    console.log("****************", completeResponse.slice(0,3));

    res.json({ posts: completeResponse });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
