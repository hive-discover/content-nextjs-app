
import Link from 'next/link';

import {Avatar, Button, Box, Divider, Paper, CardContent, Typography} from '@mui/material'

export default function CommunityColumnCard({community}){
    
    return (
        <Paper elevation={2} sx={{p : 2}}>
            <Avatar
                src={`https://images.hive.blog/u/${community.name}/avatar/medium `}
                sx={{
                    width: '128px',
                    height: '128px',
                    margin : "auto"
                }}
            />                   
            <Box sx={{ display: 'flex', flexDirection: 'column', width : "100%" }}>
                <CardContent>
                    <Typography variant="h5" component="h2">
                        {community.title}
                    </Typography>
                    <Typography variant="body2" component="span" sx={{
                            display: '-webkit-box',
                            overflow: 'hidden',
                            WebkitBoxOrient: 'vertical',
                            WebkitLineClamp: 3,
                            }}>
                        {community.about}
                    </Typography>
                    
                    <p></p>
                        
                    <Typography variant="body2" component="span" sx={{display : "flex"}}>
                        <Box sx={{textAlign : "center", width : "45%"}}>
                            {community.num_authors} Authors
                        </Box>
                        <Divider orientation='vertical' flexItem/>
                        <Box sx={{textAlign : "center", width : "45%"}}>
                            {community.num_pending} Pending Rewards
                        </Box>
                        <Divider orientation='vertical' flexItem/>
                        <Box sx={{textAlign : "center", width : "45%"}}>
                            {community.subscribers} Subscribers
                        </Box>
                    </Typography>
                </CardContent>   

                <Link href={`/c/${community.name}`} passHref>
                    <Button variant="contained">View Full</Button>
                </Link>
            </Box>                        
        </Paper>
    );
}