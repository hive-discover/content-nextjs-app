import Link from 'next/link';
import useSWR from 'swr';
import {useState, useEffect} from 'react';
import Image from 'next/image';
import getDate from '../../lib/niceTimestamp';
import parse from 'html-react-parser';

import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import {Chip, Box, Grid, CardContent, CardActionArea, Typography} from '@mui/material'

import RowPostCardLoading from './RowPostCardLoading';
import CategoryChip from '../../components/CategoryChip/CategoryChip';
import PostStats from '../../components/PostStats/PostStats';


const getThumbnailImage = (metadata, thumbnailErrors) => {
    if(!metadata || !metadata.image || metadata.length >= thumbnailErrors)
        return null;

    const theme = useTheme();
    const upMD = useMediaQuery(theme.breakpoints.up('md'));
    const upSM = useMediaQuery(theme.breakpoints.up('sm')); 
    // img widths:
    //  * <= md: 300px
    //  * == sm: 250px
    //  * == xs: full width, set height to 500px
    // (it will be scaled down to fit, so these are some limits
    let imgQueryString = "";
    if(upMD)
        imgQueryString = "?width=300";
    else if(upSM)
        imgQueryString = "?width=250";
    else
        imgQueryString = "?height=500";

    if(Array.isArray(metadata.image)){
        if(metadata.image.length > 0)
            return metadata.image[0] + imgQueryString;
    }
    
    if(typeof metadata.image === 'string')
        return metadata.image + imgQueryString;

    // Default ==> no image
    return null;
}


export default function RowPostcard({ post, author, permlink, highlight}){    

    // (maybe Post Hook) Check if we have all data, else get HIVE Post from API
    if(!post){
        const {data : fetchedPost, error : fetchPostError} = useSWR(`/api/getContent/${author}/${permlink}?reduceSize=true`, (url)=> fetch(url).then(res => res.json()));
        if(fetchedPost)
            return <RowPostcard post={fetchedPost} author={author} permlink={permlink} highlight={highlight}/>
        else
            return <RowPostCardLoading />
    }

    const [thumbnailErrors, setThumbnailErrors] = useState(0);
    const metadata = post.json_metadata;
    const thumbnail = getThumbnailImage(metadata, thumbnailErrors);

    return (
        <Grid container sx={{mt : {xs : 3, sm : 0, md : 3}, mb : {xs : 3, sm : 0, md : 3}}}>
            {/* Thumbnail Image */}
            {thumbnail 
                ? (<Grid item xs={12} sm={3} align="stretch" sx={{width: '100%', minHeight : {xs : "35vh", sm : "auto"}, maxHeight: '500px', position : "relative"}}>                
                        {/* The Image is sized correctly in getThumbnailImage so we just need to set everything to 100 */}
                        <Image src={thumbnail} onError={() => {setThumbnailErrors(thumbnailErrors + 1)}} alt="" width="100%" height="100%" layout='fill' objectFit='contain'/>
                    </Grid>
                ) : null}

            {/* Post Content */}
            <Grid item xs={12} sm={thumbnail ? 9 : 12} sx={{display : "flex", alignItems : "center"}}>
                <CardContent sx={{width : "100%"}}>     
                    <Link href={post.url || "#"} scroll={false} passHref>            
                        <CardActionArea> {/* Title, CommunityTag and Description/Body */}
                            <Typography variant="h5" component="h2" sx={{mb : 1}}>                               
                                {highlight && highlight.text_title ? parse(highlight.text_title[0]) : post.title}  
                                &nbsp;&nbsp; 
                                <CategoryChip category={post.category} />       
                                &nbsp;&nbsp;  
                                {post.isReblog || post.isCrosspost ? (<Chip 
                                    label={post.isReblog ? "Reblogged" : "Crosspost"} 
                                    color="primary"
                                    size="small"
                                />) : null}                                                                          
                            </Typography>
                            <Typography variant="body1" component="p" sx={{mb : 1}}>                            
                                {highlight && highlight.text_body ? parse(highlight.text_body[0], {}) : (metadata ? metadata.description : null)}  
                                <br/>

                                {/* Show date when it is a big display */}
                                <Box sx={{display : {xs : "none", sm : "block"}}}>
                                    <small>                                
                                        {getDate(post.created)}                              
                                    </small>
                                </Box>
                            </Typography>
                        </CardActionArea>   
                    </Link>                

                    <PostStats post={post} />
                </CardContent>
            </Grid>
        </Grid>
    );
}