import useSWR from 'swr';
import {useSession} from 'next-auth/react';
import { useEffect } from 'react';

import { useRouter } from 'next/router'
import Image from 'next/image'

import {Container, Grid, Box, Divider, CardActions, Button} from '@mui/material'

import ProfileRowCard from '../../components/ProfileRowCard/ProfileRowCard'
import AuthorInteractions from '../../components/AuthorInteractions/AuthorInteractions';

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


export default function User(props){
    const router = useRouter()
    const [username, selectedTab, ...rest] = router && router.query.params ? router.query.params : [];

    const { data: session } = useSession()
    const {data: account, error: accountError} = useSWR(`/api/getAccount/${username || "unkown"}`, (url)=> fetch(url).then(res => res.json()));
    const {data : relation, error : relationError} = useSWR(`/api/getRelationship/${session ? session.user.name : "u"}/${username}`, (url)=> fetch(url).then(res => res.json()));

    if(accountError || (account && account.error))
        return AccountNotFound();

    const profile = (account && account.posting_json_metadata && account.posting_json_metadata.profile) ? account.posting_json_metadata.profile : {};    
    
    return (
        <Container>
            {/* Header Stuff */}
            <Grid container 
                justifyContent="center"
                alignItems="center"
                sx={{
                    minHeight : {xs : "30vh", sm : "40vh", md : "50vh"}, 
                    width : "100%", 
                    background : `url(${"/api/imageProxy?imageUrl=" + profile.cover_image || "/img/blank-cover-image.svg"})`,
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
                                    <Button variant="contained" size="large" color="primary">{relation && relation.follows ? "Unfollow" : "Follow"}</Button>
                                    <Button variant="contained" size="large" color="primary">{relation && relation.ignores ? "Unmute" : "Mute"}</Button>
                                </CardActions>              
                            </Box>
                    ) : null}

                    
                </Grid>
            </Grid>           


            <AuthorInteractions username={username} selectedTab={selectedTab}/>                                                        
            
        </Container>
    );
}