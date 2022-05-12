import hive from "@hiveio/hive-js"

import parseMarkdown from "../../../../lib/parseMarkdown"

export default async function handler(req, res) {
    const { author, permlink } = req.query

    res.setHeader('Cache-control', 's-maxage=5, stale-while-revalidate=300');

    await new Promise((resolve, reject) => {
        hive.api.getContentReplies(author.replace("@", ""), permlink, async (err, result) => {
            if (!result || err || !Array.isArray(result)) 
                return reject(err || "Post not found");

            if(typeof result === "string")
                result = JSON.parse(result);

            // Parse Markdown and metadata for all Comments
            result.forEach(comment => {
                try{
                    // Try all Parsings
                    comment.body = parseMarkdown(comment.body);                
                    comment.json_metadata = JSON.parse(comment.json_metadata);
                }catch{
                    /* json_metadata not parsable */
                    comment.json_metadata = {}
                }

                return comment;
            });

            // Resolve finsihed data
            resolve(result);      
        });
    })
    .then(result => res.status(200).json(result))
    .catch(err => res.status(404).json({error: err}))
  }
  