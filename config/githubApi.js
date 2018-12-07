const axios = require('axios');


function gh(oauth_token=null) {

  if(!oauth_token){
    return axios.create({
      baseURL: 'https://api.github.com'
    });
  }
  return axios.create({
    baseURL:'https://api.github.com',
    headers: {'Authorization': `token ${oauth_token}`}
  })
}

module.exports = gh;