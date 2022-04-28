import useSWR from 'swr';
import Link from 'next/link';

import {Avatar, Button, Box, Divider, Card, CardContent, Typography, Skeleton} from '@mui/material'

export default function ProfileRowCard({username, clickable, ...rest}){

    const {data : follow_data, error : follow_error} = useSWR(`/api/getFollowCount/${username}`, (url) => fetch(url).then(res => res.json()));       
    const {data : account, error : profile_error} = useSWR(`/api/getAccount/${username}`, (url) => fetch(url).then(res => res.json()));
    
    const profile = (account && account.posting_json_metadata && account.posting_json_metadata.profile) ? account.posting_json_metadata.profile : {};

    return (
        <Card sx={{ display: 'flex'}}>
            <Box sx={{ display: 'flex', flexDirection: 'column'}}>
                <CardContent>
                    <Avatar
                        src={"/api/imageProxy?imageUrl=" + (profile ? profile.profile_image : "")}
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
                        {profile ? profile.name : <Skeleton variant="text"/>}
                    </Typography>
                    <Typography variant="body2" component="span">
                        {profile ? profile.about : <Skeleton variant="text" height={60} />}
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
                    <Link href={`/u/@${username}`} scroll={false} passHref>
                        <Button variant="contained">View Full</Button>
                    </Link>
            ) : null}                                        
            </Box>                        
        </Card>
    );
}