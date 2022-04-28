import hive from "@hiveio/hive-js"

import parseMarkdown from "../../../../lib/parseMarkdown";

export default async function handler(req, res) {
    let { author, permlink } = req.query
    author = author.replace("@", "");

    await hive.api.callAsync('bridge.get_post', { author, permlink })
    .then(result => new Promise((resolve, reject) => {if(result) resolve(result); else reject("Network error");}))
    .then(result => new Promise((resolve, reject) => {if(result.author === author && result.permlink === permlink) resolve(result); else reject("Post not found");}))
    .then(result => {
        // Parse the post
        result.body = parseMarkdown(result.body); 

        // Try to make a description
        if (!result.json_metadata.description || result.json_metadata.description.length >= 130){
            // Get first 130 text-characters from HTML. Parse max. 500 characters from HTML to save Performance
            const plainTextString = result.body.substring(0, Math.min(500, result.body.length)).replace(/<[^>]+>/g, '');

            if(plainTextString.length >= 130)
                result.json_metadata.description = plainTextString.substring(0, 130) + "...";
            else
                result.json_metadata.description = plainTextString;
        }

        return result;
    })
    .then(result => res.status(200).json(result))
    .catch(error => res.status(500).json({error: error}))
  }
  