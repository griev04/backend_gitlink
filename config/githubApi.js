const axios = require('axios');

const gh = axios.create({
  baseURL: 'https://api.github.com'
});

module.exports = gh;