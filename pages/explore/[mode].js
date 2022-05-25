import { useRouter } from "next/router";
import {useSession} from "next-auth/react";
import dynamic from "next/dynamic";
import useSWRImmutable from 'swr/immutable'
import {useEffect} from "react";
import { useRouterScroll } from '@moxy/next-router-scroll';

import { Button, Container, Divider, CircularProgress } from "@mui/material";

import useDiscussions from "../../lib/hooks/hive/useDiscussions";

const BigPostContainer = dynamic(() => import("../../components/BigPostContainer/BigPostContainer"), {ssr: false, loading: () => <center><CircularProgress /></center>});

const fetcher = (url) => fetch(url).then(res => res.json());

const AVAILABLE_MODES = (mode, session, loading) => {
    const defaultValue = {
        hook : () => useSWRImmutable("some-error-path", fetcher)
    }

    const availableModes = {
        all : {
            title : "Recommendations in General",
            hook : () => useSWRImmutable(`https://api.hive-discover.tech/v1/accounts/feed?username=${session?.user.name}&amount=25`, fetcher),
            allowed : session?.user.name
        },
        communities : {
            title : "Recommendations based on your subsribed Communities",
            hook : () => useSWRImmutable(`https://api.hive-discover.tech/v1/accounts/community-feed?username=${session?.user.name}&amount=25`, fetcher),                              
            allowed : session?.user.name
        },
        tags : {
            title : "Recommendations based on used Tags",
            hook : () => useSWRImmutable(`https://api.hive-discover.tech/v1/accounts/tag-feed?username=${session?.user.name}&amount=25`, fetcher),
            allowed : session?.user.name
        },
        trending : {
            title : "Trending Posts",
            hook : () => useDiscussions({limit : 25, sort : "trending", observer : session?.user.name}),
            allowed : true
        },
        hot : {
            title : "Hot Posts",
            hook : () => useDiscussions({limit : 25, sort : "hot", observer : session?.user.name}),
            allowed : true
        },
        new : {
            title : "New Posts",
            hook : () => useDiscussions({limit : 25, sort : "created", observer : session?.user.name}),
            allowed : true
        }
    }

    if(!availableModes[mode])
        return defaultValue; // Nothing to do

    if(loading || !availableModes[mode].allowed)
        return defaultValue; // User not logged in or is loading

    return availableModes[mode];
}

export default function exploreModeVise(props){
    const router = useRouter();
    const { mode } = router.query;
    const {data : session, loading} = useSession();
    const { updateScroll } = useRouterScroll();

    const {title, fetchData, fetchDataFunc, hook} = AVAILABLE_MODES(mode, session, loading);
    const {data, error, isValidating, mutate} = fetchDataFunc ? fetchDataFunc(fetchData) : hook();

    const posts = data ? data.posts : null;
    const isLoading = loading || (!data && !error) || isValidating
    const failed = (!isLoading && !data) || error;

    if(failed)
        console.log(`explore/[${mode}] failed`, error);

    useEffect(()=>{
        if(!isLoading && data && data.posts && data.posts.length > 0)
            updateScroll();
    }, [isLoading, posts])

    return (
        <Container>
            <h1>{title}</h1>
            <Divider />
            {   
                // Show Results
                (!failed && posts) ? <BigPostContainer posts={posts} /> : null
            }
            {
                // Show loading indicator
                (isLoading) ? <BigPostContainer posts={null} isLoading={true} loadingAmount={25} /> : null
            }
            {
                // Show error
                failed ? <center><h3>Something went wrong</h3><Button variant="contained" onClick={()=>{router.reload(window.location.pathname)}}>Retry</Button></center> : null
            }
            {
                // Refresh
                (posts && mutate) ? <center><Button variant="contained" onClick={() => {window.scrollTo(0,0); mutate()}}>Refresh Posts</Button></center> : null
            }
           

        </Container>
    )
}