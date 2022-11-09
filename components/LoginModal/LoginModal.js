import { useState, useEffect } from 'react';
import {signOut} from 'next-auth/react';

import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import Button from '@mui/material/Button';
import Backdrop from '@mui/material/Backdrop';

import Close from '@mui/icons-material/Close';
import Groups from '@mui/icons-material/Groups';

import StepOne from './Step1';
import StepTwo from './Step2';

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


export default function LoginModal({isOpen = false, signOff = false, setIsOpen = () => {}, stepNumber = 1}) {
    
    const [username, setUsername] = useState("");
    const [privateMemoKey, setPrivateMemoKey] = useState("");
    const [step, setStepNumber] = useState(stepNumber);

    useEffect(()=>{
        if(signOff){
            signOut({redirect : false});
        }
    }, [signOff]);

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
                

                <p id="parent-modal-description">
                    {
                        step === 1 ?
                        <>
                            <h4>
                                1 / 2 - Providing Account Information <small>(required)</small>
                            </h4>
                            <StepOne 
                                username={username} 
                                setIsOpen={setIsOpen} 
                                setStepNumber={setStepNumber}
                                setUsername={setUsername}
                                privateMemoKey={privateMemoKey}
                                setPrivateMemoKey={setPrivateMemoKey}
                            />
                        </> : <>
                            <h4>
                                2 / 2 - Enable Voting and Commenting <small>(optional)</small>
                            </h4>
                            <StepTwo                                
                                setIsOpen={setIsOpen} 
                                setStepNumber={setStepNumber}
                            />
                        </>
                    }
                    
                   
                </p>

            </Box>
        </Modal>
    </Backdrop>
  );
}