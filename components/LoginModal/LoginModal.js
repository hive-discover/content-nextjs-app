import Image from 'next/image';
import { useState } from 'react';

import { signIn } from "next-auth/react"
import {keychain} from '@hiveio/keychain'
// import HAS from 'hive-auth-wrapper'

import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import Button from '@mui/material/Button';
import Grid  from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import Backdrop from '@mui/material/Backdrop';

import Close from '@mui/icons-material/Close';
import Groups from '@mui/icons-material/Groups';
import Login from '@mui/icons-material/Login';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: {xs : "95%", sm : 500, md : 600},
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  pt: 2,
  px: 4,
  pb: 3,
};

const HIVE_AUTH_APP_META = {
    name: "Hive Discover", 
    description:"Discover more on HIVE AI supported",
    icon: "https://www.hive-discover.tech/img/Logo/Modern.jpg",
  }

async function onLoginKeyChain(username){
    
    const {success, msg, cancel, notInstalled, notActive} = await keychain(
        window,
        'requestEncodeMessage',
        username, 
        'action-chain',
        '#' + username,
        'Posting'
        );
    
    console.log(success, msg, cancel, notInstalled, notActive);

    if(success)
        signIn("keychain", { username : username, encoded_msg: msg })

}

// async function onLoginHiveAuth(username){
//     const auth = {
//         username: "christopher2002",
//         token: undefined,
//         expire: undefined
//     }

//     const status = HAS.status()
//     console.log(status)

//     console.log(await HAS.connect())
//     HAS.authenticate(auth, HIVE_AUTH_APP_META, {key_type : "posting", challenge : "hello World"}, (evt) => {
//         console.log(evt)    // process auth_wait message
//     });
// }

export default function LoginModal({isOpen = false, setIsOpen = () => {}}) {
    
    const [username, setUsername] = useState("");

    return (
    <Backdrop>
        <Modal
            open={isOpen}
            onClose={() => setIsOpen(false)}
            aria-labelledby="parent-modal-title"
            aria-describedby="parent-modal-description"
        >
            <Box sx={{ ...style}}>
                <h2 id="parent-modal-title">
                    <Groups />
                    &nbsp;
                    Login
                    <Button onClick={() => setIsOpen(false)} sx={{float : "right", color : "inherit"}}>
                        <Close/>
                    </Button>
                </h2>

            {/* <Button onClick={onLoginHiveAuth}>
                <Login /> Login with HiveAUht
            </Button> */}

                <p id="parent-modal-description">
                    <Grid container align="center" justify="stretch">
                        <Grid item xs={12} sm={4} sx={{position : "relative"}}>
                            <Image src="/img/Keychain.svg" layout="fill"alt="Keychain Logo"/>
                        </Grid>
                    <Grid item xs={12} sm={8}>
                            <TextField value={username} onChange={(event) => {setUsername(event.target.value);}} label="Username" variant="standard" sx={{width : "70%"}}/>
                            <br/><br/>
                            <Button variant="contained" color="primary" sx={{width : "70%"}} onClick={() => {onLoginKeyChain(username);}}>
                                Sign in &nbsp; <Login />
                            </Button>
                        </Grid>
                    </Grid>

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
                            <Button variant="contained" color="primary" sx={{width : "70%"}} onClick={()=>{signIn("hivesigner");}}>
                                Grant access &nbsp; <Login />
                            </Button>
                        </Grid>
                    </Grid>
                </p>
            </Box>
        </Modal>
    </Backdrop>
  );
}