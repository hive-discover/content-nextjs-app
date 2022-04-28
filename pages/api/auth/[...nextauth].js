import NextAuth from "next-auth"

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
        }
    ],  
    callbacks : {
        async jwt({ token, account}) {
            // Persist the OAuth access_token to the token right after signin
            if (account && account['0']) // When we have an access_token
              token.accessToken = account['0']
            
            return token
        },

        async session({session, token}) {
            // Set accessToken into every session           
            session.accessToken = token.accessToken
            return session;
        }
    }
})