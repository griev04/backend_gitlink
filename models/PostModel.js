const mongoose = require("mongoose");
mongoose.Promise = require("bluebird");
const Schema = mongoose.Schema;

const PostSchema = new Schema(
  {
    id: {
      type: String,
      required: true,
      // index: true,
      unique: true
    },
    likes: {
       type: [{ type: String, unique: true }], 
       default: [] 
      },
    comments: {
      type: [
        {
          user: { type: String, required: true },
          userId: { type: String, required: true },
          usera_avatar_url: { type: String, required: true },
          comment: { type: String, required: true },
          timestamps: { createdAt: 'created_at' },
        }
      ],
      default: []
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
  static checkPostExistence(eventId) {
    return Post.this.findByGitId(eventId);
  }

  async addComment(eventId, oneComment) {
    let post = await checkPostExistence(eventId);
    if (post === null) {
      await Post.create({ id: eventId, comments: [oneComment] });
    } else {
      await Post.findOneAndUpdate(
        { eventId },
        { $push: { comments: oneComment } }
      );
    }
  }

  async addLike(eventId, userLike) {
    let post = await checkPostExistence(eventId);
    if (post === null) {
      await Post.create({ id: eventId, likes: [userLike] });
    } else {
      await Post.findOneAndUpdate({ eventId }, { $push: { likes: userLike } });
    }
  }

  static findByGitIds(feedIds) {
    return this.find({ id: {$in: feedIds} });
  }

  static buildLike(actor_id, actor_login, timestamp) {
    return {
      actor_id,
      actor_login,
      timestamp
    };
  }
}

PostSchema.loadClass(PostClass);

const Post = mongoose.model("Post", PostSchema);

module.exports = Post;
