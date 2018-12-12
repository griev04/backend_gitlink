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
  static getPost(eventId) {
    return this.findOne({ id: eventId });
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

      let postDoc = await this.getPost(feedId);

      if (!postDoc) {
        // Create new document
        await this.create({
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
        await this.findOneAndUpdate(
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

      let postDoc = await this.getPost(feedId);

      if (!postDoc) {

        // Create new document
        await this.create({
          id: feedId,
          likes: [{ userName: login, userId: id }]
        });
      } else {
        let newLike = { userName: login, userId: id };

        // Update existing document
        await this.findOneAndUpdate(
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

  static async getFeedInteractions(ghPosts, userId) {
    // Get array of ids of the posts
    let ghPostIds = ghPosts.map(post => post.id);

    // Get the social interactions from gitLink db using post id
    let dbPosts = await this.findByGitIds(ghPostIds);

    // Find if user liked post
    dbPosts = dbPosts.map(post => ({
      ...post._doc,
      userLiked:
        post.likes.some(like => like.userId === userId)
    }));

    // Add social interactions to the feed event
    let completeFeed = ghPosts.map(post => {
      if (!post.comments) post.comments = [];
      if (!post.likes) post.likes = [];
      return{
        ...post,
        ...dbPosts.find(
        socialItem => (socialItem.id === post.id) //&& socialItem
      )
    }});

    return completeFeed;
  }
}

PostSchema.loadClass(PostClass);

const Post = mongoose.model("Post", PostSchema);

module.exports = Post;
