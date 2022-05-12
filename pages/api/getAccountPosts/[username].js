import hive from "@hiveio/hive-js"

import preparePost from "../../../lib/preparePost";

export default async function handler(req, res) {
    const {username, sort, start_author, start_permlink, observer, limit} = req.query;

    const rpc_data = {
        "sort": sort || "blog", // blog, feed, posts, replies, payout
        "account":username.replace("@", ""),
        "limit":limit || 15,
        "start_author":start_author,
        "start_permlink":start_permlink,
        "observer":observer ? observer.replace("@", "") : null
    };

    res.setHeader('Cache-control', 's-maxage=5, stale-while-revalidate=300');

    await hive.api.callAsync('bridge.get_account_posts', rpc_data)
        .then(result => new Promise((resolve, reject) => {if(result) resolve(result); else reject("Network error");}))
        .then(result => new Promise((resolve, reject) => {if(Array.isArray(result)) resolve(result); else reject("Account not found");}))
        .then(result => result.map(post => preparePost(post)))
        .then(result => res.status(200).json(result))
        .catch(error => res.status(404).json({error: error}))
  }
  