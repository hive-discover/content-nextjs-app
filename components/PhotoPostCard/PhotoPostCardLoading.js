import {Grid, Skeleton} from '@mui/material'

import PostStats from '../../components/PostStats/PostStats';

export default function PhotoPostCardLoading(){

    return (
        <Grid item xs={12} sm={6} md={4}>
            {/* Title Loading  */}
            <Skeleton variant="text" width="100%" height={32} /> 
            <Skeleton variant="text" width="100%" height={32} />           

            {/* Thumbnail  Loading */}
            <Skeleton variant="rect" width="100%" height={330} />
            
            {/* PostStats has an own loader */}
            <PostStats post={null} />
        </Grid>
    )
}