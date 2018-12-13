const express = require("express");
const router = express.Router();
const Post = require("../models/PostModel");
const User = require("../models/UserModel");

const gh = require("../config/githubApi");

router.get("/currentUser", async (req, res, next) => {

  async function getDbNotification(user) {
    const eventsResponse = await gh(user.access_token).get(
      `/users/${user.login}/events`
    );
    const ghEvents = eventsResponse.data;
    let notificationEvents = await Post.getNotifications(ghEvents);

    notificationEvents = notificationEvents.reduce((acc, event) => {
      let { comments, likes } = event;
      comments = comments.reverse();
      likes = likes.reverse();
      let result = [];
      if (comments.length > 0) {
        let commentEvent = {
          id: event.githubPost.id,
          type: "GitLinkComment",
          comments,
          created_at: new Date(
            Math.max(...comments.map(comm => comm.timestamp), 0)
          )
        };
        result = result.concat(commentEvent);
        console.log("ONE COMMENT", commentEvent);
      }

      if (likes.length > 0) {
        let likeEvent = {
          id: event.githubPost.id,
          type: "GitLinkLike",
          likes,
          created_at: new Date(
            Math.max(...likes.map(comm => comm.timestamp), 0)
          )
        };
        result = result.concat(likeEvent);

        console.log("ONE LIKE", likeEvent);
      }
      return acc.concat(result);
    }, []);
    // console.log("***********", notificationEvents.slice(0, 2));
    return notificationEvents;
  }

  async function getGhNotifications(user) {
    // Get current user's repos
    const reposResponse = await gh(user.access_token).get(
      `/users/${user.login}/repos?per_page=50&type=all`
    );

    // Get recently updated repos
    let userRepos = reposResponse.data.slice(0, 2); //.filter(repo => repo.updated_at);

    // Get events for each repo
    let reposEventsResponse = await Promise.all(
      userRepos.map(async repo => {
        let reposResponse = await gh(user.access_token).get(
          `/repos/${repo.owner.login}/${repo.name}/events?per_page=50`
        );
        return reposResponse;
      })
    );
    const repoEvents = reposEventsResponse.reduce(
      (acc, response) => acc.concat(...response.data),
      []
    ).map(oneEvent => {
      return {...oneEvent, created_at: new Date (oneEvent.created_at)};
    });

    // console.log("-------------------", repoEvents.slice(0, 2));
    return repoEvents.slice(0, 10);
  }

  try {
    const user = req.user;

    let [ghNotifications, dbNotifications] = await Promise.all([
      // EVENTS FROM GITHUB
      getGhNotifications(user),
      // EVENTS FROM GITLINK
      getDbNotification(user)
    ]);
    // let ghNotifications = await getGhNotifications(user);

    // let dbNotifications = await getDbNotification(user);

    const notifications = dbNotifications
      .concat(ghNotifications)
      .sort((first, second) => (second.created_at < first.created_at ? 1 : -1));

    // GET LIKES AND COMMENTS
    // let gitLinkNotifications = User.getUserNotification(user);

    // const result = gitLinkNotifications;
    console.log("Sending to client...");
    res.json(notifications);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
});

// router.get("/currentUser", async (req, res, next) => {
//   try {
//     const user = req.user;
//     // GET GITHUB NOTIFICATIONS
//     // let response = await gh(user.access_token).get(
//     //   `/users/${user.login}/events`
//     // );

//     // console.log('***********', response.data);
//     // GET LIKES AND COMMENTS
//     let gitLinkNotifications = User.getUserNotification(user);

//     const result = gitLinkNotifications;
//     res.json(result);
//   } catch (err) {
//     console.log(err);
//     res.status(500).json({ error: err.message });
//   }
// });

module.exports = router;
