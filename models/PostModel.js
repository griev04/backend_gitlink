const mongoose = require("mongoose");
mongoose.Promise = require("bluebird");
const Schema = mongoose.Schema;

const PostSchema = new Schema(
  {
    id: {
      type: String,
      required: true,
      index: true,
      unique: true
    },
    githubPost: {
      type: Object
    },
    likes: {
      type: Array
    },
    comments: {
      type: Array
    }
  },
  {
    timestamps: {
      createdAt: "gitlink_created_at",
      updatedAt: "gitlink_updated_at"
    }
  }
);

class PostClass {
  /**
   * This class wil host the getters/setters and the static methods for querying
   */

  /** Checks if a github event is already saed in the gitLink db
   *
   * @param eventId id of the github event
   */
  static getPost(eventId) {
    return this.findOne({ id: eventId });
  }

  /** Creates a new comment on a feed post
   *
   * @param feedId id of the github event
   * @param user user posting the comment
   * @param commentContent text of the comment
   */
  static async createComment(feedId, feedEvent, user, commentContent) {
    try {
      const { login, id, avatar_url } = user;

      console.log(`${login} with id ${id} commented on post ${feedId}`);

      const postDoc = await this.getPost(feedId);

      const newComment = {
        userName: login,
        userId: id,
        userAvatar: avatar_url,
        comment: commentContent,
        timestamp: new Date()
      };

      if (!postDoc) {
        // Create new document
        await this.create({
          id: feedId,
          githubPost: feedEvent,
          comments: [newComment]
        });
      } else {
        // Update existing document
        await this.findOneAndUpdate(
          { id: feedId },
          { $addToSet: { comments: newComment } }
        );
      }
      return true;
    } catch (err) {
      console.log(err);
    }
  }

  /** Adds a like to a feed post
   *
   * @param feedId id of the github event
   * @param user user posting the comment
   */
  static async createLike(feedId, feedEvent, user) {
    try {
      const { login, id, avatar_url } = user;

      console.log(`${login} with id ${id} liked post ${feedId}`);

      const postDoc = await this.getPost(feedId);

      const newLike = {
        userName: login,
        userId: id,
        userAvatar: avatar_url,
        timestamp: new Date()
      };

      if (!postDoc) {
        // Create new document
        await this.create({
          id: feedId,
          githubPost: feedEvent,
          likes: [newLike]
        });
      } else {
        // Update existing document
        await this.findOneAndUpdate(
          { id: feedId },
          { $addToSet: { likes: newLike } }
        );
      }

      // Create notification for receiving user

      // User.createAndSaveNotification(feedEvent, newLike, "like");

      return true;
    } catch (err) {
      console.log(err);
    }
  }

  /**
   * Retrieves records usind the github id
   * @param id github id
   */
  static findByGitIds(feedIds) {
    return this.find({ id: { $in: feedIds } });
  }

  /** Get and append comments and likes to each GitHub event
   * 
   * @param {*} ghPosts 
   * @param {*} userId 
   */
  static async getFeedInteractions(ghPosts, userId) {
    // Get array of ids of the posts
    let ghPostIds = ghPosts.map(post => post.id);

    // Get the social interactions from gitLink db using post id
    let dbPosts = await this.findByGitIds(ghPostIds);

    // Find if user liked post
    dbPosts = dbPosts.map(post => ({
      ...post._doc,
      userLiked: post.likes.some(like => like.userId === userId)
    }));

    // Add social interactions to the feed event
    let completeFeed = ghPosts.map(post => {
      if (!post.comments) post.comments = [];
      if (!post.likes) post.likes = [];
      return {
        ...post,
        ...dbPosts.find(
          socialItem => socialItem.id === post.id //&& socialItem
        )
      };
    });

    return completeFeed;
  }

  /** Get like and comment notifications from GitLink's DB
   * 
   * @param {*} ghEvents 
   */
  static async getNotifications(ghEvents) {
    // Get array of ids of the posts
    const ghPostIds = ghEvents.map(post => post.id);

    // Get the social interactions from gitLink db using post id
    let dbPosts = await this.findByGitIds(ghPostIds);

    // Get only posts with social interaction
    dbPosts = dbPosts.filter(
      post => post.likes.length > 0 || post.likes.length > 0
    );
    
    // Create output array
    dbPosts.reduce((acc, post) => {
      return acc.concat(...post.comments, ...post.likes);
    }, []);

    return dbPosts;
  }
}

PostSchema.loadClass(PostClass);

const Post = mongoose.model("Post", PostSchema);

module.exports = Post;
