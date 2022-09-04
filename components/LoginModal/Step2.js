import Image from 'next/image';
import { useState } from 'react';

import { signIn, useSession } from "next-auth/react"
import {keychain} from '@hiveio/keychain'
import {Notify} from 'notiflix/build/notiflix-notify-aio'

import Button from '@mui/material/Button';
import Grid  from '@mui/material/Grid';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';

import Login from '@mui/icons-material/Login';

import {sessionHasPostingPermission} from '../../lib/backendAuth';

export default function({setIsOpen, setStepNumber}){

    const {data : session} = useSession();
    const [isLoading, setIsLoading] = useState(false);
    const [keychainError, setKeychainError] = useState("");

    let {name : username, privateMemoKey, deviceKey} = session?.user;

    if(sessionHasPostingPermission(session)){
        // Logged completely in
        Notify.success(`Added Posting Permissions for: ` + username, {timeout: 5000, position : "right-bottom", clickToClose : true, passOnHover : true});
        setIsOpen(false);
        return <></>
    }

    const onClick_SignInKeychain = async () => {
        // Reset deviceKey on failure
        if(keychainError)
            deviceKey = null;

        setIsLoading(true);
        setKeychainError("");
    
        // Try to encode a message with KeyChain
        const {success, msg, cancel, notInstalled, notActive} = await keychain(
            window,
            'requestEncodeMessage',
            username, 
            'action-chain',
            '#' + username,
            'Posting'
        );
        
        // Handle errors
        if(!success || cancel || notInstalled || notActive){
            if(cancel)
                setKeychainError("KeyChain not installed");
            else if(!success)
                setKeychainError("KeyChain failed to encode message");
            else
                setKeychainError("KeyChain is not installed or not active");
    
            setIsLoading(false);
            return;
        }
    
        // Successfully encoded message ==> signIn
        const encodedMsg = msg;
        const result = await signIn("keychain", {username, privateMemoKey, encodedMsg, deviceKey, redirect : false});
        if(result.error){
            setIsLoading(false);
            setKeychainError(result.error);
            return;
        }

        // Successfully logged in
        setIsOpen(false)
    };

    const onClick_SignInHiveSigner = () => {
        // Redirect to HiveSigner
        window.open("/hivesigner/authorize");
    }

    return (<>
         <br/>

        <Grid container align="center" justify="stretch">
            <Grid item xs={12} sm={4} sx={{position : "relative"}}>
                <Image src="/img/Keychain.svg" layout="fill" alt="Keychain Logo"/>
            </Grid>
            <Grid item xs={12} sm={8}>
                <Typography variant='h6'>
                    KeyChain
                </Typography>
                <br/>
                <Button variant="contained" color="primary" sx={{width : "70%"}} onClick={onClick_SignInKeychain} disabled={!session}>
                    Grant access &nbsp; <Login />
                </Button>
            </Grid>
        </Grid>

        <h5 align="center">
            <p style={{color : "red"}}>
                {keychainError ? "Attention: " + keychainError : ""}
            </p>
        </h5>

        <Divider variant="middle" sx={{mt : 5, mb : 5}}/>
    
        <Grid container align="center" justify="stretch">
            <Grid item xs={12} sm={4}>
                <Image src="/img/HiveSigner.svg" height="100%" width="100%" alt="HiveSigner Logo"/>
            </Grid>
            <Grid item xs={12} sm={8}>
                <Typography variant='h6'>
                    HiveSigner
                </Typography>
                <br/>
                <Button variant="contained" color="primary" sx={{width : "70%"}} onClick={onClick_SignInHiveSigner} disabled={!session}>
                    Grant access &nbsp; <Login />
                </Button>
            </Grid>
        </Grid>

        <Divider variant="middle" sx={{mt : 5, mb : 5}}/>

        {isLoading ? (<CircularProgress color="inherit" sx={{float : "right", ml : 5}}/>) : null }
        <Button variant="outlined" color="inherit" onClick={() => {setIsOpen(false);}} sx={{float : "right"}} disabled={isLoading}> Skip </Button>
    </>)
}