import Link from 'next/link';
import {useMemo, useEffect, useRef, useState} from 'react';
import {CardActionArea, Box, Typography} from '@mui/material'

import CategoryChip from '../../components/CategoryChip/CategoryChip';
import PostStats from '../../components/PostStats/PostStats';
import PhotoPostCardLoading from '../../components/PhotoPostCard/PhotoPostCardLoading';

import PhotoLoader from '../../lib/imageHosterLoader'
import useHivePost from '../../lib/hooks/hive/useHivePost';
import useIntersection from '../../lib/hooks/useIntersection';

const setImageCaroussel = (metadata, post_url) => {
    if(!Array.isArray(metadata?.image) || metadata.image.length === 0)
        return null;
    
    return (
        <img src={PhotoLoader({src : metadata.image[0]})} width="100%" />
    )
}

export default function PhotoPostCard({post, author, permlink, lazyLoad = true}){
    post = {author, permlink, ...post}; // ensure author and permlink are set

    const loadingRef = useRef(null);
    const loadingInViewpoint = useIntersection(loadingRef, "+300px");
    const {data : newestPost, pending : postLoading, error : postError} = useHivePost((!lazyLoad || loadingInViewpoint) ? post : null);
    const postStats = useMemo(()=>(<PostStats post={newestPost} showTimestamp={true}/>), [newestPost]);
    const imageCarousel = useMemo(()=>(setImageCaroussel(newestPost?.json_metadata, newestPost?.url)), [newestPost]);


    if(postLoading || (!loadingInViewpoint && lazyLoad))
        return <> <div ref={loadingRef}></div> <PhotoPostCardLoading/></>  // pending
    if(postError)
        return null; // Error loading post  

    return (
        <Box sx={{width : "100%"}}>
            <Link href={newestPost.url || "#"} passHref>  
                <CardActionArea>
                    <Typography variant="h5" component="h2" sx={{
                        display: '-webkit-box',
                        overflow: 'hidden',
                        WebkitBoxOrient: 'vertical',
                        WebkitLineClamp: 2,
                        mb : 1,
                        height : 65
                    }}>                               
                        {newestPost.title}  
                        &nbsp;&nbsp; 
                        {newestPost ? <CategoryChip category={newestPost.category} /> : null}                                                                               
                    </Typography>
                </CardActionArea>
            </Link>        
            
            {imageCarousel}    

            {postStats}            
        </Box>
    )
}