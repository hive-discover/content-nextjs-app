import hive from "@hiveio/hive-js"

export default async function handler(req, res) {
    let {userA, userB} = req.query;
    userA = userA.replace("@", "");
    userB = userB.replace("@", "");

    if(userA.length < 2 || userB.length < 2)
        return res.status(400).json({error: "Invalid username"});

    await new Promise((resolve, reject) => {
        hive.api.call("bridge.get_relationship_between_accounts", [userA, userB], (err, result) => {
            // Check for errors
            if (err || !result || result.follows === null)
                return reject(err || "Unknown Error");
    
            resolve(result);
        });     
    })
    .then(result => res.status(200).json(result))
    .catch(err => res.status(500).json({error: err})) 
}
 



