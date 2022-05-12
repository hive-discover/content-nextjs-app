import hive from "@hiveio/hive-js"

export default async function handler(req, res) {
    const { username } = req.query

    res.setHeader('Cache-control', 's-maxage=10, stale-while-revalidate=300');

    // Get Account-Data from Hive-API
    await new Promise((resolve, reject) => {
        hive.api.getAccounts([username.replace("@", "")], function(err, result) {
            // Check for errors
            if (err) 
                return reject(err);

            // Check for acc result
            if(result && result.length > 0){
                const account = result[0];
                if(account && account.name == username.replace("@", "")){
                    try{
                        account.posting_json_metadata = JSON.parse(account.posting_json_metadata);
                    } catch{
                        account.posting_json_metadata = {};
                    }
                    
                    return resolve(account);      
                }
                              
            }
            
            res.status(404).json({error : "Account not found"})
        });     
    })
    .then(result => res.status(200).json(result))
    .catch(err => res.status(404).json({error: err}))
}
  