import {Box, Divider} from '@mui/material'

import RowPostCardLoading from '../../components/RowPostCard/RowPostCardLoading'
import RowPostCard from '../../components/RowPostCard/RowPostCard'

export default function BigPostContainer({posts, isLoading, fullData, ...rest}) {
    // Show loading skeleton
    if(!posts || isLoading){
        return Array(5).fill(0).map((_, index) => [
            (<RowPostCardLoading key={index + "-1"} />),
            (<Divider key={index + "-2"} variant="middle" orientation='horizontal' />)
        ]); 
    }

    // No posts to display
    if(posts.length === 0)
        return (<Box sx={{width : "100%", height : "10vh"}}><h4>No posts loaded.</h4></Box>);

    return (
        <Box>
            {posts.map((data, index) => {
                return [
                    (fullData ? <RowPostCard key={index + "-1"} post={data} /> : <RowPostCard key={index + "-1"} {...data} />),
                    (<Divider key={index + "-2"} variant="middle" orientation='horizontal' />)
                ];
            })}
        </Box>
    );
}