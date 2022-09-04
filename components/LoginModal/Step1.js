import { useState } from 'react';
import { useSession } from 'next-auth/react'; 

import { signIn } from "next-auth/react"
import {Notify} from 'notiflix/build/notiflix-notify-aio'

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Divider from '@mui/material/Divider';
import AccountCircle from '@mui/icons-material/AccountCircle';
import CircularProgress from '@mui/material/CircularProgress';

import Lock from '@mui/icons-material/Lock';


export default function ({username, setUsername, privateMemoKey, setPrivateMemoKey, setIsOpen, setStepNumber}){

    const { data : session } = useSession();
    const [isLoading, setIsLoading] = useState(false);
    const [authError, setAuthError] = useState("");

    if(session){
        // Already logged in ==> redirect to Step 2
        setStepNumber(2);
        return;
    }    

    const onClick_Next = async () => {
        // Reset deviceKey on failure
        let deviceKey = session?.user?.deviceKey;
        if(authError)
            deviceKey = null;

        // Reset form errors / loading
        setIsLoading(true);
        setAuthError("");

        // Sign in with simple-account
        
        const result = await signIn("simple-account", {username, privateMemoKey, deviceKey, redirect : false});
        if(result.error){
            setIsLoading(false);
            setAuthError(result.error);
            return;
        }

        // Successfully signed in
        setStepNumber(2);
        Notify.success(`Added Account @${username} without posting permissions. Voting and commenting is disabled. Change it now...`, {timeout: 5000, position : "right-bottom", clickToClose : true, passOnHover : true});
        setIsLoading(false);
    }

    return <>
        <Box sx={{ display: 'flex', alignItems: 'flex-end' }}>
            <AccountCircle sx={{ color: 'action.active', m : "auto", mr : 1}} fontSize="large" />
            <TextField id="input-username" value={username} onChange={(event) => {setUsername(event.target.value.trim().replace("@", ""));}} label="Username" variant="outlined" fullWidth/>
        </Box>

        <Divider variant="middle" sx={{mt : 2, mb : 2}}/>
    
        <Box sx={{ display: 'flex', alignItems: 'flex-end' }}>
            <Lock sx={{ color: 'action.active', m : "auto", mr : 1}} fontSize="large" />
            <TextField type="password" id="input-private-memo-key" value={privateMemoKey} onChange={(event) => {setPrivateMemoKey(event.target.value);}} label="Private Memo Key" variant="outlined" fullWidth />
        </Box>

        <h5 align="center">
            <p style={{color : "red"}}>
                {authError ? "Attention: " + authError : ""}
            </p>
            Why do we need your private memo key? - Learn more <a href="https://hivesigner.com/docs/private-memo-key">here</a>.                     
        </h5>

        <Divider variant="middle" sx={{mt : 5, mb : 2}}/>

        {isLoading ? (<CircularProgress color="inherit" sx={{float : "right", ml : 5}}/>) : null }

        <Button variant="contained" color="primary" onClick={onClick_Next} sx={{float : "right"}} disabled={isLoading} > Next </Button>
    </>
}