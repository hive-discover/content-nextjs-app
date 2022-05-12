import hive from "@hiveio/hive-js"

export default async function handler(req, res) {
    let {author} = req.query;
    author = author.replace("@", "");

    res.setHeader('Cache-control', 's-maxage=3, stale-while-revalidate=180');
    
    await new Promise(() => {
        hive.api.getFollowCount(author, function(err, result) {
            if(result && result.account === author)
                return res.status(200).json(result); // success

            result = JSON.parse(result);
            if(result && result.id && result.result)
                return res.status(404).json({error : "Account not Found"}); // Account not Found

            res.status(404).json({error : (err || result || "Unknown Error")});
        });    
    });
}
 