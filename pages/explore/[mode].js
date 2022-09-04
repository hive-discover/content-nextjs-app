import { useRouter } from "next/router";
import {useSession} from "next-auth/react";
import dynamic from "next/dynamic";
import useSWRImmutable from 'swr/immutable'
import useSWR from 'swr';
import {useEffect, useState} from "react";
import { useRouterScroll } from '@moxy/next-router-scroll';

import { Button, Container, Divider, CircularProgress } from "@mui/material";

import {getDeviceKeyEncodedMessage} from '../../lib/backendAuth';
import {chooseMode} from '../../lib/exploration'

const BigPostContainer = dynamic(() => import("../../components/BigPostContainer/BigPostContainer"), {ssr: false, loading: () => <center><CircularProgress /></center>});
const LoginModal = dynamic(() => import("../../components/LoginModal/LoginModal"), {ssr: false, loading: () => <center><CircularProgress /></center>});

const HiveDiscoverAPI_POST_Fetcher = ({data, path}) => fetch("https://api.hive-discover.tech/v1" + path, {method : "POST", body : JSON.stringify(data), headers : {'Content-Type' : 'application/json'}})
  .then(res => res.json())

 

export default function exploreModeVise(props){
    const router = useRouter();
    const { mode } = router.query;
    const { updateScroll } = useRouterScroll();

    const {data : session, status : sessionStatus} = useSession();
    const {data : msg_encoded} = useSWR(session, getDeviceKeyEncodedMessage, {refreshInterval : 60});

    const modeLoading = (!router.isReady || sessionStatus === "loading" || (session && !msg_encoded));
    const {title, dataHook, allowed, logInViewpoint} = chooseMode(mode, session, modeLoading, msg_encoded);
    const {data : hookData, error, isValidating, mutate} = dataHook();

    useEffect(()=>{
            if(!modeLoading && !(!allowed || error) && hookData?.posts.length > 0)
                updateScroll();
        });

    if(modeLoading){
        return <center><CircularProgress /></center>
    }

    if(!allowed || error){
        return <Container>
            {
                // Show error
                error ? <center><h3>Something went wrong</h3><Button variant="contained" onClick={()=>{router.reload(window.location.pathname)}}>Retry</Button></center> : null
            }
            {
                // Show not allowed ==> oportunity to login
                !allowed ? <center><h3>Please sign in</h3> <LoginModal isOpen={true} /> </center> : null
            }
        </Container>
    }

    const logOnInViewpoint = async (post) => {
        const result = await HiveDiscoverAPI_POST_Fetcher({
            data : {
                msg_encoded, 
                metadata : {author : post.author, permlink : post.permlink},
                activity_type : "post_recommended",
                private_memo_key : session?.user.privateMemoKey, 
                username : session?.user.name
            }, 
            path : "/activities/add"
        });
    }

    const postsAreLoading = !hookData || isValidating;
    return <Container>
        <h1>{title}</h1>
        <Divider />

        <BigPostContainer posts={hookData?.posts} isLoading={postsAreLoading} loadingAmount={25} onInViewpoint={logInViewpoint ? logOnInViewpoint : null} />

        {
            // Refresh
            (hookData?.posts && mutate) ? <center><Button variant="contained" onClick={() => {window.scrollTo(0,0); mutate()}}>Refresh Posts</Button></center> : null
        }
    </Container>
}