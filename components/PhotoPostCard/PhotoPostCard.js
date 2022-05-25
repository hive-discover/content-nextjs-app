import useSWR from 'swr';
import Link from 'next/link';

import {CardActionArea, Grid, Typography} from '@mui/material'

import "react-responsive-carousel/lib/styles/carousel.min.css";
import { Carousel } from 'react-responsive-carousel';

import CategoryChip from '../../components/CategoryChip/CategoryChip';
import PostStats from '../../components/PostStats/PostStats';
import PhotoPostCardLoading from '../../components/PhotoPostCard/PhotoPostCardLoading';

import PhotoLoader from '../../lib/imageHosterLoader'

const setImageCaroussel = (metadata, post_url) => {
    if(!metadata || !metadata.image || !Array.isArray(metadata.image) || metadata.image.length === 0)
        return null;

    if(metadata.image.length > 5)
        metadata.image = metadata.image.slice(0, 5);
    
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
                                        filter: index === 4 ? "blur(10px)" : null
                                    }}
                                />
                                
                                    {index === 4  ? <p className='legend'><Link href={post_url || "#"} passHref>View all Images</Link></p> : null}
                                
                            </div>
                        );
                    })
                }
        </Carousel>
    )
}

export default function PhotoPostCard({post, author, permlink, highlight}){

    if(!post){
        const {data : fetchedPost, error : fetchPostError} = useSWR(`/api/getContent/${author}/${permlink}`, (url)=> fetch(url).then(res => res.json()));
        if(fetchPostError || fetchedPost?.error)
            return null;
        if(!fetchedPost)
            return <PhotoPostCardLoading />
            
        return <PhotoPostCard post={fetchedPost} author={author} permlink={permlink} highlight={highlight}/>           
    }

    return (
        <Grid item xs={12} sm={6} md={4}>
            <Link href={post.url || "#"} passHref>  
                <CardActionArea>
                    <Typography variant="h5" component="h2" sx={{
                        display: '-webkit-box',
                        overflow: 'hidden',
                        WebkitBoxOrient: 'vertical',
                        WebkitLineClamp: 2,
                        mb : 1,
                        height : 65
                    }}>                               
                        {post.title}  
                        &nbsp;&nbsp; 
                        {post ? <CategoryChip category={post.category} /> : null}                                                                               
                    </Typography>
                </CardActionArea>
            </Link>        
            
            {setImageCaroussel(post.json_metadata, post.url)}
            

            <PostStats post={post} showTimestamp={true}/>
        </Grid>
    )
}