import hive from "@hiveio/hive-js"

import preparePost from '../../../../lib/preparePost'

// Remove Body and active votes
const postReducer = (post) => {
  post.body = null
  post.active_votes = null
  return post;
}

export default async function handler(req, res) {
    let { author, permlink, reduceSize } = req.query
    author = author.replace("@", "");

    res.setHeader('Cache-control', 's-maxage=5, stale-while-revalidate=500');

    await hive.api.callAsync('bridge.get_post', { author, permlink })
    .then(result => new Promise((resolve, reject) => {if(result) resolve(result); else reject("Network error");}))
    .then(result => new Promise((resolve, reject) => {if(result.author === author && result.permlink === permlink) resolve(result); else reject("Post not found");}))
    .then(result => preparePost(result))
    .then(result => reduceSize ? postReducer(result) : result)
    .then(result => res.status(200).json(result))
    .catch(error => res.status(404).json({error: error}))
  }
  