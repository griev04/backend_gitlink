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
  static checkPostExistence(eventId) {
    return this.find({ id: eventId });
  }

  /** Creates a new comment on a feed post
   *
   * @param feedId id of the github event
   * @param user user posting the comment
   * @param commentContent text of the comment
   */
  static async createComment(feedId, user, commentContent) {
    try {
      const { login, id, avatar_url } = user;

      console.log(`${login} with id ${id} commented on post ${feedId}`);

      let postDocs = await this.checkPostExistence(feedId);

      let result;
      if (postDocs.length === 0) {
        // Create new document
        result = await this.create({
          id: feedId,
          comments: [
            {
              userId: id,
              login,
              avatar_url,
              comment: commentContent,
              timestamp: new Date()
            }
          ]
        });
      } else {
        let newComment = {
          userId: id,
          login,
          avatar_url,
          comment: commentContent,
          timestamp: new Date()
        };

        // Update existing document
        result = await this.findOneAndUpdate(
          { id: feedId },
          { $addToSet: { comments: newComment } }
        );
      }
    } catch (err) {
      console.log(err);
    }
  }

  /** Adds a like to a feed post
   *
   * @param feedId id of the github event
   * @param user user posting the comment
   */
  static async createLike(feedId, user) {
    try {
      const { login, id } = user;

      console.log(`${login} with id ${id} liked post ${feedId}`);

      let postDocs = await this.checkPostExistence(feedId);

      let result;
      if (postDocs.length === 0) {

        // Create new document
        result = await this.create({
          id: feedId,
          likes: [{ userName: login, userId: id }]
        });
      } else {
        let newLike = { userName: login, userId: id };

        // Update existing document
        result = await this.findOneAndUpdate(
          { id: feedId },
          { $addToSet: { likes: newLike } }
        );
      }
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

  static async getFeedInteractions(posts, userId) {
    // Get array of ids of the posts
    let searchArray = posts.map(post => post.id);

    // Get the social interactions from gitLink db using post id
    let socialFeed = await this.findByGitIds(searchArray);

    // Find if user liked post
    let socialUserFeed = socialFeed.map(item => ({
      ...item._doc,
      userLiked:
        item.likes.filter(like => like.userId === userId).length > 0
          ? true
          : false
    }));

    // Add social interactions to the feed event
    let completeFeed = posts.map(feedItem => ({
      ...feedItem,
      ...socialUserFeed.find(
        socialItem => socialItem.id === feedItem.id && socialItem
      )
    }));

    return completeFeed;
  }
}

PostSchema.loadClass(PostClass);

const Post = mongoose.model("Post", PostSchema);

module.exports = Post;
