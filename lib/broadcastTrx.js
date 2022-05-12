
// Send operation to the blockchain.
//  * HiveSigner needs the transaction to do it
const sendToHiveSigner = (operations, access_token) => fetch(
        "https://hivesigner.com/api/broadcast", 
        {method : "POST", headers : {'Content-Type' : 'application/json', 'Authorization': access_token}, body : JSON.stringify({"operations" : operations})}
    )
    .then(response => [response.json(), true])
    .catch(err => [err, false]);

//  * Keychain needs it splitted
const sendToKeychain = async (operations, username) => {
    const {keychain} = await import('@hiveio/keychain');

    for(const [op, payload] of operations){
        // Send OP to keychain and get the return code
        let op_result = null
        switch(op){
            case "vote":
                op_result = await keychain(
                    window,
                    'requestVote',
                    username, 
                    payload.permlink,
                    payload.author,
                    payload.weight
                );
        }

        // Handle the result (especially the errors)
        const {success, msg, cancel, notInstalled, notActive} = op_result;
        if(success)// Nothing to handle ==> complete success
            continue; 

        // An error occured
        if(cancel)
            return ["Canceled by user", false];
        if(notInstalled)
            return ["Keychain not installed", false];
        if(notActive)
            return ["Keychain not active", false];

        // Unknown error
        return [msg, false];
    }

    return ["Success", true];
}

export async function broadcastTrx(operations, session) {

    switch(session ? session.provider : null){
        case "hivesigner":
            return await sendToHiveSigner(operations, session.accessToken);
        case "keychain":
            return await sendToKeychain(operations, session.user.name);
        default:

            return ["User not logged In", false];          
    }
}

async function notifyFailure(msg){
    console.log("Error on Broadcasting Vote: ", msg);
    const {Notify} = await import('notiflix/build/notiflix-notify-aio');
    Notify.failure(`Error on Broadcasting Vote: ${msg}`, {timeout: 5000, position : "right-bottom", clickToClose : true, passOnHover : true});
}

export async function broadcastVote(session, author, permlink, weight){
    // Send Trx to Correct Authentication Service
    const operations = [
        [
            "vote", 
            {
                author : author,
                permlink : permlink,
                voter : session.user.name,
                weight : weight
            }
        ]
    ];
    const [response, success] = await broadcastTrx(operations, session);

    if(!success) {
        await notifyFailure(response || "Unexpected Error");
        return false;
    }

    return true;
}