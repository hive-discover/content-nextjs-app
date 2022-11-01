import hivecrypt from "hivecrypt";

export function sessionHasPostingPermission(session){
    return session?.provider === "keychain" || session?.provider === "hivesigner";
}

export async function encodeMessageToActionChain(privateMemoKey, msg){
    // Get action-chain public memo key
    const url = process.env.NEXTAUTH_URL ? `${process.env.NEXTAUTH_URL}/api/getKeys/action-chain/memo` : "/api/getKeys/action-chain/memo";
    const response = await fetch(url, {method : "GET"});
    const actionChainPubMemoKey = await response.text();
    return hivecrypt.encode(privateMemoKey, actionChainPubMemoKey, msg.startsWith("#") ? msg : "#" + msg);
}

export async function getDeviceKeyEncodedMessage(session){
    const {deviceKey, name : username, privateMemoKey} = session?.user || {};
    if(deviceKey && username && privateMemoKey)
        return (await encodeMessageToActionChain(privateMemoKey, JSON.stringify({deviceKey, createdAt : Date.now()})).then(msg => msg.slice(1)));

    return null;
}

export async function verifyPrivateKey(username, privateMemoKey){
    // Get encrypted message from API
    const msg = username + "-" + Date.now();
    const response = await fetch(`${process.env.NEXTAUTH_URL}/api/getEncodedMessage/${username}?msg=${msg}`).then(res => res.json());
    if(response.error || response.status !== "ok"){        
        return false;
    }

    // Decrypt message and check if it is valid: username and timestamp
    try {
        const decryptedMessage = hivecrypt.decode(privateMemoKey, response.encoded_msg);
        if(msg === decryptedMessage.slice(1))
            return true;
        
    } catch (e) {
        console.error("Error trying to decode /parse msg: " + e);
        return false;
    }

    return false;
}

export async function verfiyDeviceKey(session){
    // Encode message
    const msg_encoded = await getDeviceKeyEncodedMessage(session);
    if(!msg_encoded)
        return false;

    // Send message to API
    try{
        const response = await fetch(`https://api.hive-discover.tech/v1/accounts/verify-device?username=${session?.user.name}&msg_encoded=${msg_encoded}&user_id=${session?.user.user_id}`, { method : "GET"});
        const responseJson = await response.json();
        if(responseJson?.status === "ok")
            return true;

        // Cannot verify this device
        console.error("Cannot verify this device: ", responseJson);
        return false;
    } catch(e){
        console.error("Error trying to send encoded message to API: " + e);
        return false;
    }
}