const express = require("express");
const router = express.Router();
const Post = require("../models/PostModel");

const gh = require("../config/githubApi");

async function getFeedInteractions(feedArray, userId) {
  // Get array of ids of the posts
  let searchArray = feedArray.map(post => post.id);

  // Get the social interactions from gitLink db using post id
  let socialFeed = await Post.findByGitIds(searchArray);

  // Find if user liked post
  let socialUserFeed = socialFeed.map(item => ({
    ...item._doc,
    userLiked: (item.likes.filter(like => like.userId === userId ).length > 0) ? true : false,
  }))

  // Add social interactions to the feed event
  let completeFeed = feedArray.map(feedItem => ({
    ...feedItem,
    ...socialUserFeed.find(
      socialItem => socialItem.id === feedItem.id && socialItem
    )
  }));

  return completeFeed;
}

router.get("/currentUser", async (req, res, next) => {
  try {
    const user = req.user;
    let response = await gh(user.access_token).get(
      `/users/${user.login}/received_events`
    );

    let completeResponse = await getFeedInteractions(response.data, user.id);

    res.json({ posts: completeResponse });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
});

router.post("/handleLike", async (req, res, next) => {
  try {
    const user = req.user;
    const { login, id } = user;
    const { feedId } = req.body;

    console.log(`${login} with id ${id} liked post ${feedId}`);
    
    let postDocs = await Post.checkPostExistence(feedId);
    
    let result;
    if (postDocs.length === 0) {
      console.log("CREATING...");

      // Create new document
      result = await Post.create({
        id: feedId,
        likes: [{ userName: login, userId: id }]
      });
    } else {
      console.log("UPDATING...");
      let newLike = { userName: login, userId: id };

      // Update existing document
      result = await Post.findOneAndUpdate(
        { id: feedId },
        { $addToSet: { likes: newLike } }
      );
    }
    res.json({ result: result });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
