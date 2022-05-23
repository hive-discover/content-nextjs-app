import useSWR from 'swr';
import Link from 'next/link';

import {Avatar, Button, Box, Divider, Card, CardContent, Typography, Skeleton} from '@mui/material'

export default function ProfileRowCard({username, clickable, profile,...rest}){
    username = (username || "unknown").replace("@", "");    
    let loading = false;

    const {data : follow_data, error : follow_error} = useSWR(`/api/getFollowCount/${username}`, (url) => fetch(url).then(res => res.json()));   
    if(!profile || Object.keys(profile).length === 0){
        const {data : account, error : profile_error} = useSWR(`/api/getAccount/${username}`, (url) => fetch(url).then(res => res.json()));
        if(account)
            profile = (account.posting_json_metadata.profile) ? account.posting_json_metadata.profile : {};
        else
            loading = true;
    }
    
    return (
        <Card sx={{ display: 'flex'}}>
            <Box sx={{ display: 'flex', flexDirection: 'column'}}>
                <CardContent>
                    <Avatar
                        src={`https://images.hive.blog/u/${username}/avatar/medium `}
                        sx={{
                            width: '100px',
                            height: '100px',
                        }}
                    />                   
                </CardContent>
            </Box> 
            <Box sx={{ display: 'flex', flexDirection: 'column', width : "100%" }}>
                <CardContent>
                    <Typography variant="h5" component="h2">
                        {!loading && profile ? (profile.name || username) : <Skeleton variant="text"/>}
                    </Typography>
                    <Typography variant="body2" component="span">
                        {!loading && profile ? profile.about : <Skeleton variant="text" height={60} />}
                    </Typography>
                    
                    <p></p>
                        
                    <Typography variant="body2" component="span" sx={{display : "flex"}}>
                        <Box sx={{textAlign : "center", width : "45%"}}>
                            {follow_data ? `${follow_data.follower_count} Followers` : <Skeleton />}
                        </Box>
                        <Divider orientation='vertical' flexItem/>
                        <Box sx={{textAlign : "center", width : "45%"}}>
                            {follow_data ? `${follow_data.following_count} Following` : <Skeleton />}
                        </Box>
                    </Typography>
                </CardContent>   

                {clickable ? (
                    <Link href={`/u/@${username}`} passHref>
                        <Button variant="contained">View Full</Button>
                    </Link>
            ) : null}                                        
            </Box>                        
        </Card>
    );
}