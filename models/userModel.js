const mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
const Schema = mongoose.Schema;

const UserSchema = new Schema({

  id: {
    type: String,
    required: true,
    index: true,
    unique: true,
  },
  access_token: String,
  login: String,
  avatar_url: String,
  url: String,
  html_url: String,
  followers_url: String,
  following_url: String,
  gists_url: String,
  starred_url: String,
  subscriptions_url: String,
  organizations_url: String,
  repos_url: String,
  events_url: String,
  received_events_url: String,
  type: String,
  site_admin: String,
  name: String,
},{
  timestamps: { createdAt: "gitlink_created_at", updatedAt: "gitlink_updated_at" }
});


class UserClass {
  /**
   * This class wil host the getters/setters and the static methods for querying
   */

  /**
   * Retrieves a user given his login (nickname on github)
   * @param login
   */
  static findOneByLogin(login){
    return this.findOne({login});
  }

  /**
   * Retrieves a record usind the github id
   * @param id github id
   */
  static findByGitId(id){
    return this.findOne({id})
  }

}


UserSchema.loadClass(UserClass);

const User = mongoose.model('User', UserSchema);

module.exports = User;