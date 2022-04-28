import hive from "@hiveio/hive-js"

import parseMarkdown from "../../../lib/parseMarkdown";

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

    await hive.api.callAsync('bridge.get_account_posts', rpc_data)
        .then(result => new Promise((resolve, reject) => {if(result) resolve(result); else reject("Network error");}))
        .then(result => new Promise((resolve, reject) => {if(Array.isArray(result)) resolve(result); else reject("Account not found");}))
        .then(result => result.map(post_entry => {
            // Parse the post
            post_entry.body = parseMarkdown(post_entry.body); 

            // Try to make a description
            if (!post_entry.json_metadata.description ||post_entry.json_metadata.description.length >= 130){
                // Get first 130 text-characters from HTML. Parse max. 500 characters from HTML to save Performance
                const plainTextString = post_entry.body.substring(0, Math.min(500, post_entry.body.length)).replace(/<[^>]+>/g, '');

                if(plainTextString.length >= 130)
                    post_entry.json_metadata.description = plainTextString.substring(0, 130) + "...";
                else
                    post_entry.json_metadata.description = plainTextString;
            }

            return post_entry;
        }))
        .then(result => res.status(200).json(result))
        .catch(error => res.status(500).json({error: error}))
  }
  