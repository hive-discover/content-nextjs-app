import hivecrypt from "hivecrypt";

export function sessionHasPostingPermission(session){
    return session?.provider === "keychain" || session?.provider === "hivesigner";
}

export async function verifyPrivateKey(username, privateMemoKey){
    // Get encrypted message from API
    const response = await fetch(`${process.env.NEXTAUTH_URL}/api/getEncryptedMessage/${username}`).then(res => res.json());
    if(response.error || response.status !== "ok"){        
        return false;
    }

    // Decrypt message and check if it is valid: username and timestamp
    try {
        const decryptedMessage = hivecrypt.decode(privateMemoKey, response.encoded_msg);
        const decryptedMessageJSON = JSON.parse(decryptedMessage.slice(1));

        // Timestamp and username validation
        if(decryptedMessageJSON.timestamp >= Date.now() - 1000 * 10 && decryptedMessageJSON.username === username){
            return true;
        }
    } catch (e) {
        console.error("Error trying to decode /parse msg: " + e);
        return false;
    }

    return false;
}
