import Link from 'next/link';
import useSWR from 'swr';
import {useState, useEffect} from 'react';
import dynamic from 'next/dynamic';
import { useRef } from 'react';

import Image from 'next/image';

import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import {Chip, Box, Grid, CardContent, CardActionArea, Typography, Divider} from '@mui/material'

const RowPostCardLoading = dynamic(() => import('./RowPostCardLoading'));
import CategoryChip from '../../components/CategoryChip/CategoryChip';
import PostStats from '../../components/PostStats/PostStats';

import myLoader from '../../lib/imageHosterLoader';
import useHivePost from '../../lib/hooks/hive/useHivePost';
import useIntersection from '../../lib/hooks/useIntersection'

const getThumbnailImage = (metadata, thumbnailErrors) => {
    const theme = useTheme();
    const upMD = useMediaQuery(theme.breakpoints.up('md'));
    const upSM = useMediaQuery(theme.breakpoints.up('sm')); 


    if(!metadata || !metadata.image || metadata.length >= thumbnailErrors)
        return null;

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

const doHighlighting = async (highlight, setTitle, setBody) => {
    const parse = await import('html-react-parser').then(m => m.default);

    if(highlight.text_body)
        setBody(parse(highlight.text_body[0]));
    if(highlight.text_title)
        setTitle(parse(highlight.text_title[0]));
}


export default function RowPostcard({ showLoading = false, post, author, permlink, highlight, onInViewpoint}){    
    post = {author, permlink, ...post}; // ensure author and permlink are set

    // Set hooks 
    const {data : newestPost, pending : postLoading, error : postError} = useHivePost(!showLoading ? post : null);
    const [thumbnailErrors, setThumbnailErrors] = useState(0);
    const [title, setTitle] = useState(newestPost?.title);
    const [body, setBody] = useState(newestPost?.json_metadata?.description);

    // Fire on in viewpoint event
    const bodyRef = useRef(null);
    if(onInViewpoint){
        const bodyInViewport = useIntersection(bodyRef, '-200px');
        useEffect(()=>{
            if(bodyInViewport && body)
                onInViewpoint(post);
        },[bodyInViewport, body]);
    }

    // Parse highlight OR use post metadata
    useEffect(() => {
        if(highlight) // we have to mark
            doHighlighting(highlight, setTitle, setBody);  
        else if(newestPost && !postError){
            // Nothing to mark
            setTitle(newestPost.title);
            setBody(newestPost.json_metadata?.description);
        }
    }, [newestPost, highlight]);
    
    const thumbnail = getThumbnailImage(newestPost?.json_metadata, thumbnailErrors);

    if(postLoading || showLoading)
        return <RowPostCardLoading/>
    if(postError)
        return null; // Just skip this post

    const isPinned = post?.stats?.is_pinned; // Only when we got the Bridge.get_ranked_posts data
    console.log(isPinned);

    return (
        <Grid container sx={{mt : {xs : 3, sm : 0, md : 3}, mb : {xs : 3, sm : 0, md : 3}}}>
            {/* Thumbnail Image */}
            {thumbnail 
                ? (<Grid item xs={12} sm={3} align="stretch" sx={{width: '100%', minHeight : {xs : "35vh", sm : "auto"}, maxHeight: '500px', position : "relative"}}>                
                        {/* The Image is sized correctly in getThumbnailImage so we just need to set everything to 100 */}
                        <Image 
                            src={thumbnail} 
                            loader={myLoader} 
                            onError={() => {setThumbnailErrors(thumbnailErrors + 1)}} 
                            alt="Post Thumbnail" 
                            layout='fill' 
                            objectFit='contain'
                        />
                    </Grid>
                ) : null}

            {/* Post Content */}
            <Grid item xs={12} sm={thumbnail ? 9 : 12} sx={{display : "flex", alignItems : "center"}}>
                <div ref={bodyRef}></div>
                <CardContent sx={{width : "100%"}}>     
                {/* {
                    isPinned
                    ? (<Divider><Chip label="Pinned" color="primary" variant="outlined"/></Divider>)
                    : null
                } */}
                    <Link href={newestPost.url || "#"} passHref>            
                        <CardActionArea> {/* Title, CommunityTag and Description/Body */}
                            <Typography variant="h5" component="h2" sx={{mb : 1}}>                               
                                {title}  
                                &nbsp;&nbsp; 
                                <CategoryChip category={newestPost.category} />       
                                &nbsp;&nbsp;  
                                {
                                    newestPost.isReblog || newestPost.isCrosspost 
                                    ? (<Chip 
                                        label={newestPost.isReblog ? "Reblogged" : "Crosspost"} 
                                        color="primary"
                                        size="small"
                                        />) 
                                    : null
                                }  
                                &nbsp;&nbsp;  
                                {
                                    isPinned
                                    ? (<Chip label="Pinned" color="primary" variant="outlined"/>)
                                    : null
                                }                                                                        
                            </Typography>
                            <Typography variant="body1" component="p" sx={{mb : 1}}>                            
                                { body }  
                            </Typography>
                        </CardActionArea>   
                    </Link>                

                    <PostStats post={newestPost} />
                </CardContent>
            </Grid>
        </Grid>
    );
}