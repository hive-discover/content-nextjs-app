import { useRouter } from "next/router";
import {useSession} from "next-auth/react";
import dynamic from "next/dynamic";
import useSWRImmutable from 'swr/immutable'
import useSWR from 'swr';
import {useEffect, useState} from "react";

import { Box, Button, Container, Divider, CircularProgress, Stack, Typography, Tooltip } from "@mui/material";

import {getDeviceKeyEncodedMessage} from '../../lib/backendAuth';
import {chooseMode, getLogOnInViewpointFunction} from '../../lib/exploration'

const BigPostContainer = dynamic(() => import("../../components/BigPostContainer/BigPostContainer"), {ssr: false, loading: () => <center><CircularProgress /></center>});
const LoginModal = dynamic(() => import("../../components/LoginModal/LoginModal"), {ssr: false, loading: () => <center><CircularProgress /></center>});

const getTopBar = (sessionStatus) => {


    const isLoggedIn = sessionStatus === "authenticated";

    return <>    
        <Stack direction="row" sx={{justifyContent : "space-evenly", p : 3, textAlign : "center"}}>

            <Box>
                <Typography variant="h6">Recommendations</Typography>
                <Tooltip title={isLoggedIn ? null : "Please login to see recommendation"}>
                    <Stack direction="row" spacing={1}>
                        <Button variant="text" href="/explore/all" disabled={!isLoggedIn}>All</Button>
                        <Button variant="text" href="/explore/communities" disabled={!isLoggedIn}>Communities</Button>
                        <Button variant="text" href="/explore/tags" disabled={!isLoggedIn}>Tags</Button>
                    </Stack>
                </Tooltip>
            </Box>

            <Divider orientation="vertical" flexItem />

            <Box>
                <Typography variant="h6">HIVE</Typography>
                <Stack direction="row" spacing={1}>
                    <Button variant="text" href="/explore/trending">Trending</Button>
                    <Button variant="text" href="/explore/hot">Hot</Button>
                    <Button variant="text" href="/explore/new">New</Button>
                </Stack>
            </Box>
        </Stack>

        <Divider />
    </>
}

export default function exploreModeVise(props){
    const router = useRouter();
    const { mode } = router.query;

    const {data : session, status : sessionStatus} = useSession();
    const {data : msg_encoded} = useSWR(session, getDeviceKeyEncodedMessage, {refreshInterval : 60});

    const modeLoading = (!router.isReady || sessionStatus === "loading" || (session && !msg_encoded));
    let {title, dataHook, allowed, logInViewpoint} = chooseMode(mode, session, modeLoading, msg_encoded);
    const {data : hookData, error, isValidating, mutate} = dataHook();

    if(modeLoading){
        return <center><CircularProgress /></center>
    }

    allowed = error?.message === "401" ? null : allowed;
    if(!allowed || error){
        return <Container>
            {getTopBar(sessionStatus)}
            {
                // Show error
                error ? <center><h3>Something went wrong</h3><Button variant="contained" onClick={()=>{router.reload(window.location.pathname)}}>Retry</Button></center> : null
            }
            {
                // Show not allowed ==> oportunity to login
                !allowed ? <center><h3>Please sign in</h3> <LoginModal isOpen={true} signOff={true} /> </center> : null
            }
        </Container>
    }

    const postsAreLoading = !hookData || isValidating;
    return <Container>
        {getTopBar(sessionStatus)}
        <h1>{title}</h1>

        <BigPostContainer posts={hookData?.posts} isLoading={postsAreLoading} loadingAmount={25} onInViewpoint={logInViewpoint ? getLogOnInViewpointFunction(session) : null} />

        {
            // Refresh
            (hookData?.posts && mutate) ? <center><Button variant="contained" onClick={() => {window.scrollTo(0,0); mutate()}}>Refresh Posts</Button></center> : null
        }
    </Container>
}