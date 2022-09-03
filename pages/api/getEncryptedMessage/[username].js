import hive from "@hiveio/hive-js"
import hivecrypt from "hivecrypt";

export default async function handler(req, res) {
    let {username} = req.query;
    
    const account = await hive.api.callAsync("condenser_api.get_accounts", [[username],]).then(response => {

        if(response.length === 1)
            return response[0];  

        res.status(404).json({error : "Account not found"});
    });    
    if(!account)
        return;

    const msg = JSON.stringify({timestamp : Date.now(), username : username});
    const encoded_msg = hivecrypt.encode(process.env.ActionChain_PRV_POSTING, account.memo_key, "#" + msg);
    return res.status(200).json({
        "status" : "ok",
        "encoded_msg" : encoded_msg
    });
}
 