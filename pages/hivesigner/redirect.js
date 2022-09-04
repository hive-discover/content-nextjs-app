import Head from 'next/head'
import Script from 'next/script';
import { useRouter } from 'next/router';
import { useState } from 'react';

import { useSession, signIn, signOut  } from 'next-auth/react';

import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import Button from '@mui/material/Button';

import LoginModal from '../../components/LoginModal/LoginModal';
import {sessionHasPostingPermission} from '../../lib/backendAuth';

const containerWrapper = (children) => {
    return <Container sx={{display : "flex", textAlign : "center", alignItems : "center", height : "100vh"}}>
        {children}
    </Container>
}

const wrongAccount = (session, reqUsername) => {
    return <>
        <h3>You are logged in as '{session.user.name}' but you are trying to login as '{reqUsername}' with HiveSigner</h3>
        <Box sx={{display : "flex", justifyContent : "center", alignItems : "center", gap : "1rem"}}>
            <Button variant="contained" onClick={() => open("/hivesigner/authorize")}>Retry on HiveSigner</Button>
            <Button variant="contained" onClick={() => signOut ({redirect : false})}>Retry Login Process</Button>
        </Box>
    </>
}

export default function redirect() {
    const [message, setMessage] = useState("");
    const { data: session, status : sessionStatus } = useSession();
    const router = useRouter();

    // Show Message if any
    if(message){
        return containerWrapper(<h1>{message}</h1>)
    }

    // Loading: Router & Session
    if(!router.isReady || sessionStatus === "loading"){
        return containerWrapper(
            <Box style={{width : "100%", alignItems : "center"}}>
                <CircularProgress />
            </Box>
        );
    }

    // Check if user is already logged in with Posting Authority
    if(sessionHasPostingPermission(session)){
        return containerWrapper(<Box style={{width : "100%", alignItems : "center"}}>
            <h1>Successfully logged in with Posting Authority</h1>
            <Divider variant="middle" />
            <Button variant="contained" onClick={() => window.close()}>Close Window</Button>
        </Box>);
    }

    // Check query params existence
    const {access_token, username : reqUsername, expires_in} = router.query;
    if(!access_token || !reqUsername || !expires_in){
        return containerWrapper(
            <Box style={{width : "100%", alignItems : "center"}}>
                <h1>Invalid request</h1>
                <Divider variant="mddle" />
                <h3>No Arguments provided</h3>
            </Box>
        )
    }
    
    // Check if user is logged in / choosed right account
    if(session?.user.name !== reqUsername){
        return containerWrapper(
            <Box style={{width : "100%", alignItems : "center"}}>
                <h1>Unauthorized</h1>
                <Divider variant="mddle" />
                { 
                    session?.user.name 
                    ? wrongAccount(session, reqUsername)
                    : <LoginModal isOpen={true} />
                }
            </Box>
        )
    }

    const {privateMemoKey, deviceKey} = session.user;
    
    
    return (
        <Container sx={{display : "flex", textAlign : "center", alignItems : "center", height : "100vh"}}>

            <Script
                id="hivesigner-signin"
                strategy="lazyOnload"
                src="https://hive-discover.tech/non-existant-script.js"
                onError={async () => {
                    const result = await signIn("hivesigner", {redirect : false, accessToken : access_token, expiresIn : expires_in, username : reqUsername, privateMemoKey, deviceKey});
                    setMessage(result.error);          
                }}
            />

            <Box style={{width : "100%", alignItems : "center"}}>
                <CircularProgress />
                <h1>Sign in...</h1>
            </Box>
            
        </Container>
    )
}
