
import {Grid, CardContent, Typography, Skeleton} from '@mui/material'

export default function RowPostCardLoading(props){

    return (
        <Grid container sx={{width : "100%", height : "250px"}}>
            {/* Thumbnail Image */}
            <Grid item xs={12} sm={2} sx={{alignItems : "center", justifyContent : "center"}}>                
                <Skeleton width="100%" height="100%" />
            </Grid>

            {/* Post Content */}
            <Grid item xs={12} sm={10}>
                <CardContent>
                        <Typography variant="h5" component="h2" sx={{mb : 1}}>
                            <Skeleton />
                        </Typography>
                        <Typography variant="body1" component="p" sx={{mb : 2}}>
                            <Skeleton width="85%" />
                            <Skeleton width="85%" />
                            <Skeleton width="85%" />
                        </Typography>

                    {/* Author, Votes, Replies and Date */}
                    <Typography variant="caption" sx={{display : "flex", alignItems : "center"}}>
                        <Skeleton variant="circle" width={20} height={20} />
                        
                        &nbsp;&nbsp;&nbsp;
                        &nbsp;&nbsp;&nbsp;  
                        
                        <Skeleton width="100%" />
                    </Typography>
                
                </CardContent>
            </Grid>

        </Grid>
    )
}