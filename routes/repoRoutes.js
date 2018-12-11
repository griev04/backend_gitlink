const express = require('express');
const router = express.Router();

const gh = require('../config/githubApi');


/**
 * @api {get} /repos/search Searches a repo in github
 * @apiName SearchRepo
 * @apiGroup Repo
 *
 * @apiParam {String} query name of the repository to look for
 *
 * @apiSuccess {[Object]} items array of repository objects
 *
 */
router.get('/search', async (req, res, next) => {
  try{
    const user = req.user;
    const {query} = req.query;
    let response = await gh(user.access_token).get(`/search/repositories?q=${query}`);
    res.json({
      items: response.data.items
    })
  } catch(err){
    console.log(err);
    res.status(500).json({error: err.message})
  }
});


module.exports = router;