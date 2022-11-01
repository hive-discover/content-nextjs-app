import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials";

import hivecrypt from "hivecrypt";
import { verifyPrivateKey, verfiyDeviceKey } from '../../../lib/backendAuth';

const backendMinCredentials = {username : "", privateMemoKey : "", deviceKey : ""};
const backendAuthorize = async (credentials, req) => {
    const {
        username, 
        privateMemoKey, 
        deviceKey : prevSessionDeviceKey,
        user_id : prevSessionUserId,
        privateActivityKey : prevSessionPrivateActivityKey,
        publicActivityKey : prevSessionPublicActivityKey,
    } = credentials;

    // Validate the credentials
    if(username.length < 3)
        return Promise.reject(new Error("Username is not valid"));
    
    if(privateMemoKey.length < 50 || privateMemoKey.length > 60)
        return Promise.reject(new Error("Private Memo Key is not valid"));                

    
    // Form Input is valid, verify private memo key                
    if(await verifyPrivateKey(username, privateMemoKey) === false)
        return Promise.reject(new Error(`Private Memo Key could not be verified togehter with '${username}'`));

    // Decode the device key from our API
    let deviceKey = prevSessionDeviceKey;
    let publicActivityKey = prevSessionPublicActivityKey, privateActivityKey = prevSessionPrivateActivityKey, user_id = prevSessionUserId;
    if(!deviceKey || deviceKey.length < 10){
        // Register device at backend API
        const deviceName = `${req.headers['user-agent']}.${Math.floor(Math.random() * 1000000)}`;
        const deviceRegistration = await fetch(`https://api.hive-discover.tech/accounts/register-device?username=${username}&deviceName=${deviceName}`, {method : "GET"}).then(res => res.json()).catch(() => {return Promise.reject(new Error("Could not register device at backend API"))});
        if(deviceRegistration?.status !== "ok")
            return Promise.reject(new Error(`Device could not be registered at backend API`));

        try{
            const decoded_msg = hivecrypt.decode(privateMemoKey, deviceRegistration.msg_encoded);
            deviceKey = JSON.parse(decoded_msg.slice(1)).deviceKey;
        }catch(e){
            return Promise.reject(new Error(`Could not decode device key from backend API`));
        }


        // Decode activity_infos: publicActivityKey, privateActivityKey, user_id
        try{
            const decoded_msg = hivecrypt.decode(privateMemoKey, deviceRegistration.activity_info.infoMessage);
            const activity_infos = JSON.parse(decoded_msg.slice(decoded_msg.indexOf("{")));
            publicActivityKey = activity_infos.publicKey;
            privateActivityKey = activity_infos.privateKey;
            user_id = activity_infos.userID;
        }catch(e){
            return Promise.reject(new Error(`Could not decode activity infos from backend API`));
        }
        
    } 

    // Verify device key at backend API
    if(await verfiyDeviceKey({user : {deviceKey, name : username, privateMemoKey, publicActivityKey, privateActivityKey, user_id }}) === false)
        return Promise.reject(new Error(`Device key could not be verified at backend API`));

    // Successfully verified private memo key
    return {name : username, privateMemoKey, deviceKey, publicActivityKey, privateActivityKey, user_id};
}

export default NextAuth({
    // Configure one or more authentication providers 
    providers: [
        CredentialsProvider({
            name : "Simple Hive Account (no posting rights)",
            id : "simple-account",
            credentials : backendMinCredentials,
            authorize : backendAuthorize
        }),
        CredentialsProvider({
            name : "HiveSigner",
            id : "hivesigner",
            credentials : {
                ...backendMinCredentials,
                accessToken : "",
                expiresIn : 0
            },
            async authorize(credentials, req){
                const {username, privateMemoKey, accessToken, expiresIn} = credentials;

                // Validate the credentials
                const profile = await backendAuthorize(credentials, req);

                // Validate the access token by requesting user information
                try{
                    const hivesigner_profile = await fetch(`https://hivesigner.com/api/me?code=${accessToken}&client_secret=${process.env.HiveSigner_ClientSecret}`).then(res => res.json())
                    if(hivesigner_profile?.user === username){
                        profile.accessToken = accessToken;
                        profile.expiresIn = expiresIn;
                        return profile;
                    }

                    return Promise.reject(new Error("HiveSigner access token is not valid"));
                } catch (e){
                    return Promise.reject(new Error("HiveSigner failed to verify your access token. Try later again..."));
                }   
            }
        }),
        CredentialsProvider({
            name : "Keychain",
            id : "keychain",
            credentials : {
                ...backendMinCredentials,
                encodedMsg : ""
            },
            async authorize(credentials, req){
                const {username, privateMemoKey, encodedMsg} = credentials;

                // Validate the credentials
                const profile = await backendAuthorize(credentials, req);

                // Validate the encoded message
                try{
                    const decryptedMessage = hivecrypt.decode(process.env.ActionChain_PRV_POSTING, encodedMsg);
                    if(decryptedMessage.slice(1) === username)
                        return profile;
                } catch (e){
                    return Promise.reject(new Error("Keychain failed to verify the encoded message"));
                }   

                return Promise.reject(new Error("Unknown error"));
            }
        })
    ],  
    callbacks : {
        async jwt({ token, account, user}) {            
            if(user?.privateMemoKey)
                token.privateMemoKey = user.privateMemoKey;
            if(user?.accessToken)
                token.accessToken = user.accessToken;     
            if(user?.expiresIn)
                token.expiresIn = user.expiresIn;
            if(user?.deviceKey)
                token.deviceKey = user.deviceKey;     
            if(user?.user_id)
                token.user_id = user.user_id;
            if(user?.privateActivityKey)
                token.privateActivityKey = user.privateActivityKey;
            if(user?.publicActivityKey)
                token.publicActivityKey = user.publicActivityKey;  

            if(account?.privateMemoKey)
                token.privateMemoKey = account.privateMemoKey;   
            if(account?.accessToken)
                token.accessToken = account.accessToken; 
            if(account?.expiresIn)
                token.expiresIn = account.expiresIn;
            if(account?.deviceKey)
                token.deviceKey = account.deviceKey;
            if(account?.user_id)
                token.user_id = account.user_id;
            if(account?.privateActivityKey)
                token.privateActivityKey = account.privateActivityKey;
            if(account?.publicActivityKey)
                token.publicActivityKey = account.publicActivityKey;

            if(account?.provider)
                token.provider = account.provider;
             
            return token
        },

        async session({session, token, user}) {
            // Set privateMemoKey and provider into every session   
            session.provider = token.provider;
            session.user.deviceKey = token.deviceKey;
            session.user.privateMemoKey = token.privateMemoKey;
            session.user.accessToken = token.accessToken;
            session.user.user_id = token.user_id;
            session.user.privateActivityKey = token.privateActivityKey;
            session.user.publicActivityKey = token.publicActivityKey;

            return session;
        }
    }
})