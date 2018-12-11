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
      type: [
        {
          userId: { type: String },
          userName: { type: String},
        }        
      ],
      type: Array
    },
    comments: {
      type: Array
      // type: [
      //   {
      //     userId: { type: String, required: true },
      //     userName: { type: String },
      //     usera_avatar_url: { type: String },
      //     comment: { type: String }
      //   }
      // ],
      // default: []
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
    return this.find({ id: eventId });
  }

  static async addComment(eventId, oneComment) {
    let post = await this.checkPostExistence(eventId);
    if (post === null) {
      await Post.create({ id: eventId, comments: [oneComment] });
    } else {
      await Post.findOneAndUpdate(
        { eventId },
        { $push: { comments: oneComment } }
      );
    }
  }

  static async appendLike(eventId, user) {
    try {
      const { userName, userId } = user;
      let post = await this.checkPostExistence(eventId);
      if (post === null) {
        await Post.create({ id: eventId, likes: [userId] });
      } else {
        await Post.findOneAndUpdate(
          { eventId },
          { $push: { likes: { userName, userId } } }
        );
      }
    } catch (err) {
      console.log(err);
    }
  }

  static findByGitIds(feedIds) {
    return this.find({ id: { $in: feedIds } });
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
