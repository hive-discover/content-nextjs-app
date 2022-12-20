import useSWR from 'swr';
import {useSession} from 'next-auth/react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router'
import Image from 'next/image'
import {useEffect, useState} from 'react';
import Head from "next/head";

import Container from '@mui/material/Container'
import Grid from '@mui/material/Grid'
import Divider from '@mui/material/Divider'
import Box from '@mui/material/Box'
import CardActions from '@mui/material/CardActions'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress';

import useAccount from '../../lib/hooks/hive/useAccount';
import useRelationship from '../../lib/hooks/hive/useRelationship';
import ProfileRowCard from '../../components/ProfileRowCard/ProfileRowCard'
const AuthorInteractions = dynamic(() => import('../../components/AuthorInteractions/AuthorInteractions'), {ssr: false, loading: () => <CircularProgress sx={{m : 5}}/>});

const AccountNotFound = () => {
    const router = useRouter()
    const {username} = router.query;

    return (
        <Container sx={{height : "100vh", display : "flex", justifyContent : "center", alignItems : "center"}}>
            <Box sx={{display : "flex", flexDirection : "column", justifyContent : "center", alignItems : "center"}}>
                <Image src="/img/blank-profile-avatar.png" alt="" height={150} width={150}/>

                <Box sx={{display : "block", textAlign : "center"}}>
                    <h2>Unkown Account</h2>       
                    <Divider variant="middle" orientation='horizontal' flexItem />     
                    <h3>{username}</h3>
                </Box>
            </Box>    
        </Container>
    )
};


export default function User({setPreTitle = null}){
    const router = useRouter()
    const [username, selectedTab, ...rest] = router && router.query.params ? router.query.params : [];

    const { data: session } = useSession()
    const {data : account, pending : accountPending, error : accountError} = useAccount({username});
    const {data : relation, error : relationError} = useRelationship(session?.user?.name ? [session.user.name, username] : null);

    const profile = (account?.posting_json_metadata && account.posting_json_metadata?.profile) ? account.posting_json_metadata.profile : {};    
    
    useEffect(() => {
        if(profile && !accountPending)
        {
            setPreTitle && setPreTitle(profile.name + " (" + username + ")");
        }
    }, [profile, accountPending]);

    if(accountError)
        return AccountNotFound();


    return (
        <>
        <Head>
            {profile?.about && <meta property="description" content={profile.about} />}
            {account && <meta property="og:title" content={profile?.name || username} />}
            {profile?.about && <meta property="og:description" content={profile.about} />}
            {account && <meta property="og:image" content={`https://images.hive.blog/u/${username.replace("@", "") }/avatar/large`} />}
        </Head>
        <Container>
            {/* Header Stuff */}
            <Grid container 
                justifyContent="center"
                alignItems="center"
                sx={{
                    minHeight : {xs : "30vh", sm : "40vh", md : "50vh"}, 
                    width : "100%", 
                    background : `url(${profile.cover_image ? "/api/imageProxy?imageUrl=" + profile.cover_image : "/img/blank-cover-image.svg"})`,
                    backgroundSize : "cover",
                    backgroundPosition : "center",
                    backgroundRepeat : "no-repeat",
                    pb : 5
                }}
            >     
                <Grid item xs={12} sx={{height : {xs : "15vh", sm : "25vh", md : "35vh"}}}></Grid>

               <Grid item xs={12} sm={8} md={6}>         
                    <ProfileRowCard username={username} clickable={false}/>       
                    
                    {!session || !username || session.user.name !== username.replace("@", "") 
                        ? ( <Box sx={{ display: 'flex', alignItems: 'center', justifyContent : "center", pl: 1}}>             
                                <CardActions>
                                    <Button variant="contained" size="large" color="primary">{relation?.follows ? "Unfollow" : "Follow"}</Button>
                                    <Button variant="contained" size="large" color="primary">{relation?.ignores ? "Unmute" : "Mute"}</Button>
                                </CardActions>              
                            </Box>
                    ) : null}

                    
                </Grid>
            </Grid>           

            <Box sx={{display : "flex", alignItems : "center", justifyContent : "center", width : "100%"}}>
                <AuthorInteractions username={username} selectedTab={selectedTab} session={session}/>                                                        
            </Box> 
        </Container></>
    );
}