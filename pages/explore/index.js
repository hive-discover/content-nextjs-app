import { useSession } from 'next-auth/react';
import useSWR from 'swr'
import { useRouter } from 'next/router'

import Container from '@mui/material/Container'

import {chooseMode} from '../../lib/exploration'
import { CircularProgress, Divider } from '@mui/material';
import { useEffect } from 'react';


export default function explore(props){

    const {data : session, status : sessionStatus} = useSession();
    const router = useRouter();
 
    // Prefetch some of the explore page data
    const toPrefetch = ["all", "communities", "tags", "trending", "hot", "new"];
    toPrefetch.forEach(mode => {
        const {dataHook, allowed} = chooseMode(mode, session, false);
        if(sessionStatus !== "loading") 
        {
            if(allowed) 
            {
                dataHook();
                return;
            }          
        }
               
        // Session is loading, or the user is not allowed to see this mode
        useSWR(null, () => null); // dummy hook
    })

    useEffect(() => {
        if(sessionStatus === "loading") return;

        if(sessionStatus === "authenticated") 
        {
            // User is logged in
            router.push("/explore/all");
            return;
        }

        // User is not logged in
        router.push("/explore/trending");
    }, [sessionStatus])

    return (
        <Container sx={{height : "80vh"}}>
            <h1>Explore</h1>
            <Divider />

            <center>
                <CircularProgress />
            </center>
        </Container>
    )
}