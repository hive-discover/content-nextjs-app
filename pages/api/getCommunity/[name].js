import hive from "@hiveio/hive-js"

export default async function handler(req, res) {
    const {name} = req.query

    res.setHeader('Cache-control', 's-maxage=5, stale-while-revalidate=300');

    // Get Account-Data from Hive-API
    await new Promise((resolve, reject) => {
        hive.api.call("bridge.get_community", {name : name}, (err, result) => {
            // Check for errors
            if (err || !result || result.name !== name)
                return reject(err || "Community not found");
    
            resolve(result);
        });     
    })
    .then(result => res.status(200).json(result))
    .catch(err => res.status(404).json({error: err}))
}
  