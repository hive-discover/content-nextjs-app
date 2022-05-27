import Link from 'next/link';
import Image from 'next/image';

import {Box, Card, CardActionArea, Skeleton, Typography, Grid} from '@mui/material'
import myLoader from '../../lib/imageHosterLoader';
import useHivePost from '../../lib/hooks/hive/useHivePost';

const getThumbnailImage = (metadata) => {
    if(!metadata || !metadata.image)
        return null;

    const imgQueryString = "?width=100";

    if(Array.isArray(metadata.image)){
        if(metadata.image.length > 0)
            return metadata.image[0] + imgQueryString;
    }
    
    if(typeof metadata.image === 'string')
        return metadata.image + imgQueryString;

    // Default ==> no image
    return null;
}

const loader = ()=>{
    return (
        <Card sx={{p : 1, display : "flex", alignItems : "center", justifyContent : "flex-start"}}>
            <Skeleton variant="rect" width={75} height={75} style={{borderRadius : 5}}/>
            &nbsp;&nbsp;
            <Box sx={{width : "100%"}}>
                <Skeleton variant="text" height={25} width="100%"/>
                <Skeleton variant="text" height={15} width="100%"/>
                <Skeleton variant="text" height={15} width="100%"/>
            </Box>
        </Card>                           
    )
}

export default function Item({author, permlink, post}){
    post = {author, permlink, ...post}; // ensure author and permlink are set

    const {data : newestPost, pending : postLoading, error : postError} = useHivePost(post);

    if(postLoading) 
        return loader();
    if(postError)
        return null;


    const metadata = newestPost.json_metadata;
    const thumbnail = getThumbnailImage(metadata);

    return (
        <Grid container>
            {/* Thumbnail Image */}
            {thumbnail 
                ? (<Grid item xs={12} sm={3} align="stretch" sx={{width: '100%', maxHeight: '250px', position : "relative"}}>                
                        {/* The Image is sized correctly in getThumbnailImage so we just need to set everything to 100 */}
                        <Image src={thumbnail} loader={myLoader} alt="" width="100%" height="100%" layout='fill' objectFit='contain' style={{borderRadius : 20}}/>
                    </Grid>
                ) : null}

            {/* Post Content */}
            <Grid item xs={12} sm={thumbnail ? 9 : 12} sx={{display : "flex", alignItems : "center"}}>
                <Link href={newestPost.url || "#"} passHref>            
                    <CardActionArea sx={{pl : 2, mt : 1, mb : 1}}>
                        <Typography variant="h6" sx={{
                            display: '-webkit-box',
                            overflow: 'hidden',
                            WebkitBoxOrient: 'vertical',
                            WebkitLineClamp: 2,
                            }}
                        >
                            {newestPost.title}
                        </Typography>   
                        <Typography variant="caption" sx={{
                            display: '-webkit-box',
                            overflow: 'hidden',
                            WebkitBoxOrient: 'vertical',
                            WebkitLineClamp: 2,
                            }}
                        >
                            {metadata?.description}
                        </Typography> 
                    </CardActionArea>   
                </Link>                
            </Grid>
        </Grid>                      
    )
}