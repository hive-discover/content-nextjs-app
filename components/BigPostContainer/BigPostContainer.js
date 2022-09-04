import dynamic from 'next/dynamic';
import {Box, Divider} from '@mui/material'


import RowPostCardLoading from '../../components/RowPostCard/RowPostCardLoading'
const RowPostCard = dynamic(() => import('../../components/RowPostCard/RowPostCard'), {ssr: false, loading: () => <RowPostCardLoading />});

export default function BigPostContainer({posts, isLoading, fullData, loadingAmount, onInViewpoint, ...rest}) {
    // Show loading skeleton
    if(!posts || isLoading){
        return <Box sx={{width : "100%"}}>
                    {
                        Array(loadingAmount).fill(0).map((_, index) => [
                            (<RowPostCardLoading key={index + "-1"} style={{width : "100%"}} />),
                            (<Divider key={index + "-2"} variant="middle" orientation='horizontal' />)
                        ])
                    }
            </Box>
    }

    // No posts to display
    if(posts.length === 0)
        return (<Box sx={{width : "100%", height : "10vh"}}><h4>No posts loaded.</h4></Box>);

    return (
        <Box>
            {posts.map((data, index) => {
                return [
                    (fullData ? <RowPostCard key={index + "-1"} onInViewpoint={onInViewpoint} post={data} /> : <RowPostCard key={index + "-1"} onInViewpoint={onInViewpoint} {...data} />),
                    (<Divider key={index + "-2"} variant="middle" orientation='horizontal' />)
                ];
            })}
        </Box>
    );
}