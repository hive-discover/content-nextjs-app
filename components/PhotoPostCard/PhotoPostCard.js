import Link from 'next/link';
import {useMemo} from 'react';
import {CardActionArea, Grid, Typography} from '@mui/material'

import "react-responsive-carousel/lib/styles/carousel.min.css";
import { Carousel } from 'react-responsive-carousel';

import CategoryChip from '../../components/CategoryChip/CategoryChip';
import PostStats from '../../components/PostStats/PostStats';
import PhotoPostCardLoading from '../../components/PhotoPostCard/PhotoPostCardLoading';

import PhotoLoader from '../../lib/imageHosterLoader'
import useHivePost from '../../lib/hooks/hive/useHivePost';

const setImageCaroussel = (metadata, post_url) => {
    if(!metadata || !metadata.image || !Array.isArray(metadata.image) || metadata.image.length === 0)
        return null;

    if(metadata.image.length > 3)
        metadata.image = metadata.image.slice(0, 3);
    
    return (
        <Carousel 
                infiniteLoop={true} 
                renderThumbs={()=>{}} // Disable thumbnails
            >
                { 
                    metadata.image.map((url, index) => {
                        return (
                            <div key={index}>
                                <img 
                                    src={PhotoLoader({src : url, height : 330})}
                                    alt={"Image " + (index + 1)}
                                    style={{
                                        height : 330,
                                        filter: index === 2 ? "blur(10px)" : null
                                    }}
                                />
                                
                                    {index === 2  ? <p className='legend'><Link href={post_url || "#"} passHref>View all Images</Link></p> : null}
                                
                            </div>
                        );
                    })
                }
        </Carousel>
    )
}

export default function PhotoPostCard({post, author, permlink}){
    post = {author, permlink, ...post}; // ensure author and permlink are set

    const {data : newestPost, pending : postLoading, error : postError} = useHivePost(post);
    const postStats = useMemo(()=>(<PostStats post={newestPost} showTimestamp={true}/>), [newestPost]);
    const imageCarousel = useMemo(()=>(setImageCaroussel(newestPost?.json_metadata, newestPost?.url)), [newestPost]);
    
    if(postLoading)
        return <PhotoPostCardLoading />  // pending
    if(postError)
        return null; // Error loading post  

    return (
        <Grid item xs={12} sm={6} md={4}>
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
        </Grid>
    )
}