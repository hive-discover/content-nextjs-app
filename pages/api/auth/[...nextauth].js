import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials";

import hivecrypt from "hivecrypt";

export default NextAuth({
    // Configure one or more authentication providers 
    providers: [
        {
            id: "hivesigner",
            name: "HiveSigner",
            type: "oauth",
            scope: "vote,comment",
            clientSecret: process.env.HiveSigner_ClientSecret,
            clientId: process.env.HiveSigner_ClientId,
            authorization: "https://hivesigner.com/oauth2/authorize",
            redirect_uri: process.env.NEXTAUTH_URL + "/api/auth/callback/hivesigner",
            token: {
                url: "https://hivesigner.com/api/oauth2/token",
                async request(context) {              
                  const response = await fetch(context.provider.token.url + `?code=${context.params.code}&client_secret=${context.provider.clientSecret}`);
                  const json = await response.json();
                  return {tokens : [json.access_token]};
                }
            },
            userinfo: {
                url : "https://hivesigner.com/api/me",
                async request(context) {
                    const response = await fetch(context.provider.userinfo.url + `?code=${context.tokens["0"]}&client_secret=${context.provider.clientSecret}`);
                    const json = await response.json();
                    return json;
                }
            },
            profile(profile) {
                return {
                    id: profile._id,
                    name : profile.name
                };
            }
        },
        CredentialsProvider({
            name : "Keychain",
            id : "keychain",
            credentials : {
                username : "",
                encoded_msg : ""
            },
            async authorize(credentials, req){
                // Decode and check that message is valid
                try{
                    const plain_msg = hivecrypt.decode(process.env.ActionChain_PRV_POSTING, credentials.encoded_msg);
                    if(plain_msg === "#" + credentials.username)
                        return {name : credentials.username};
                }catch(e){
                    console.error("Error Decoding Login-Message (Keychain) for ", credentials.username)
                    console.error(e);
                }

                // Failed
                return null;
            }
        })
    ],  
    callbacks : {
        async jwt({ token, account}) {
            if (account) {
                // User is logged in ==> set provider
                token.provider = account.provider;
                
                if(account['0']) // When we have an access_token from hivesigner
                    token.accessToken = account['0'];                      
            }
                            
            return token
        },

        async session({session, token}) {
            // Set accessToken and provider into every session           
            session.accessToken = token.accessToken
            session.provider = token.provider;

            return session;
        }
    }
})