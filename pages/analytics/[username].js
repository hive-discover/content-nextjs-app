import useSWR from 'swr';
import useSWRImmutable from 'swr/immutable'
import {useSession} from 'next-auth/react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router'
import { useRouterScroll } from '@moxy/next-router-scroll';
import {useEffect, useState} from 'react';

import North from '@mui/icons-material/North'
import NorthEast from '@mui/icons-material/NorthEast'
import East from '@mui/icons-material/East'
import SouthEast from '@mui/icons-material/SouthEast'
import South from '@mui/icons-material/South'

import {CircularProgress, Container, Divider, Grid, Typography} from '@mui/material';
const RowPostCard = dynamic(() => import('../../components/RowPostCard/RowPostCard'), {ssr: false, loading: () => <center><CircularProgress /></center>});

const initActivityAuth = async(session, setTrackingAuth)=>{
    if(!session) return;

    if(session.provider === "hivesigner"){
        setTrackingAuth("access_token=" + session.accessToken);
    }

    if(session.provider === "keychain"){
        const keychain = await import('@hiveio/keychain').then(m=>m.keychain);
        const {success, msg} = await keychain(
            window,
            'requestEncodeMessage',
            session.user.name, 
            'action-chain',
            '#' + session.user.name,
            'Posting'
        );

        if(success){
            setTrackingAuth("keychain_signed_msg=" + encodeURIComponent(msg));
        }
    }

}

export default function Analytics(props){
    const router = useRouter()

    const {username} = router.query;
    const { data: session } = useSession();

    // Prepare Tracking Auth
    const [activityAuth, setActivityAuth] = useState(null);
    useEffect(()=>{
        if(session && !activityAuth)
            initActivityAuth(session, setActivityAuth);
    }, [session, activityAuth])

    const {data : activityData, error : activityError} = useSWR(
        activityAuth && username ? `https://api.hive-discover.tech/v1/activities/view?amount=25&username=${username.replace("@", "")}&${activityAuth}` : null, 
        (url)=> fetch(url).then(res => res.json())
    );

    return (
        <Container>
            <h1>Analytics <small>- show top 25 most interesting posts you saw</small></h1>
            <Divider />
            <Grid container spacing={2}>
                {
                    activityData?.status === "ok" ? activityData.result.map(({author, permlink, score}, i) => {
                        return (
                            <Grid item key={i} xs={12}>
                                <Grid container spacing={2}>
                                    <Grid item xs={12} md={1} textAlign="center" align="stretch" alignContent="center">
                                        <Typography variant="h6" component="h6">
                                            {/* Calculate Percentage with one decimal */}
                                            {Math.floor(score * 1000) / 10}%
                                            <br/>
                                            {/* Set Indicator  */}
                                            {
                                                score >= 0.8 ? <North /> : null
                                            }
                                            {
                                                score >= 0.6 && score < 0.8 ? <NorthEast /> : null
                                            }
                                            {
                                                score >= 0.4 && score < 0.6 ? <East /> : null
                                            }
                                            {
                                                score >= 0.2 && score < 0.4 ? <SouthEast /> : null
                                            }
                                            {
                                                score < 0.2 ? <South /> : null
                                            }

                                        </Typography>
                                    </Grid>
                                    <Grid item xs={12} md={11}>                                     
                                        <RowPostCard author={author} permlink={permlink} />                                       
                                    </Grid>   
                                </Grid>                            
                            </Grid>
                        )
                    }) : <center><CircularProgress /></center>
                }
            </Grid>
        </Container>
    )
}