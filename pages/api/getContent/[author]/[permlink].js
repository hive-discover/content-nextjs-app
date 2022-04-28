import hive from "@hiveio/hive-js"

import preparePost from '../../../../lib/preparePost'

export default async function handler(req, res) {
    let { author, permlink } = req.query
    author = author.replace("@", "");

    await hive.api.callAsync('bridge.get_post', { author, permlink })
    .then(result => new Promise((resolve, reject) => {if(result) resolve(result); else reject("Network error");}))
    .then(result => new Promise((resolve, reject) => {if(result.author === author && result.permlink === permlink) resolve(result); else reject("Post not found");}))
    .then(result => preparePost(result))
    .then(result => res.status(200).json(result))
    .catch(error => res.status(500).json({error: error}))
  }
  