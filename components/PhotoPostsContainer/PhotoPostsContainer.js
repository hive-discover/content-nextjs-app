
import dynamic from 'next/dynamic';
import {Box, Divider, Grid} from '@mui/material'

import PhotoPostCardLoading from '../../components/PhotoPostCard/PhotoPostCardLoading'
const PhotoPostCard = dynamic(() => import('../../components/PhotoPostCard/PhotoPostCard'), {ssr: false, loading: () => <PhotoPostCardLoading />});

const renderLoading = (loadingAmount)=>{
    return (
            Array(loadingAmount).fill(0).map((_, index) => [
                (<PhotoPostCardLoading key={index + "-1"} />)
            ])
        )
                   
}

export default function PhotoPostsContainer({posts, isLoading, fullData, loadingAmount = 7, ...rest}) {
    // No posts to display
    if(posts && !isLoading && posts.length === 0)
        return (<Box sx={{width : "100%", height : "10vh"}}><h4>No posts loaded.</h4></Box>);

    return (
        <Box>
            <Grid container spacing={5} padding={3}>
                {
                    !posts || isLoading 
                    ? renderLoading(loadingAmount) 
                    : posts.map((data, index) => {
                          return (fullData ? <PhotoPostCard key={index + "-1"} post={data} /> : <PhotoPostCard key={index + "-1"} {...data} />);
                      })
                }
            </Grid>
        </Box>
    );
}