import Link from 'next/link';
import Image from 'next/image';
import useSWR from 'swr';

import {Box, Card, CardActionArea, CardContent, Skeleton, Typography, Grid} from '@mui/material'
import myLoader from '../../lib/imageHosterLoader';

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

export default function Item({author, permlink, post, highlight}){
    
    if(!post){
        const {data : fetchedPost, error : fetchPostError} = useSWR(`/api/getContent/${author}/${permlink}?reduceSize=true`, (url)=> fetch(url).then(res => res.json()));
        if(fetchedPost)
            return <Item author={fetchedPost.author} permlink={permlink} post={fetchedPost} highlight={highlight}/>;
        else 
            return loader();
    }

    const metadata = post.json_metadata;
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
                <Link href={post.url || "#"} passHref>            
                    <CardActionArea sx={{pl : 2, mt : 1, mb : 1}}>
                        <Typography variant="h6" sx={{
                            display: '-webkit-box',
                            overflow: 'hidden',
                            WebkitBoxOrient: 'vertical',
                            WebkitLineClamp: 2,
                            }}
                        >
                            {highlight && highlight.text_title ? parse(highlight.text_title[0]) : post.title}
                        </Typography>   
                        <Typography variant="caption" sx={{
                            display: '-webkit-box',
                            overflow: 'hidden',
                            WebkitBoxOrient: 'vertical',
                            WebkitLineClamp: 2,
                            }}
                        >
                            {highlight && highlight.text_body ? parse(highlight.text_body[0], {}) : (metadata ? metadata.description : null)}
                        </Typography> 
                    </CardActionArea>   
                </Link>                
            </Grid>
        </Grid>                      
    )
}