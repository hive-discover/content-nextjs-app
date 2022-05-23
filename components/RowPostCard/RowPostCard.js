import Link from 'next/link';
import useSWR from 'swr';
import {useState, useEffect} from 'react';
import dynamic from 'next/dynamic';

import Image from 'next/image';
import getDate from '../../lib/niceTimestamp';

import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import {Chip, Box, Grid, CardContent, CardActionArea, Typography} from '@mui/material'

const RowPostCardLoading = dynamic(() => import('./RowPostCardLoading'));
import CategoryChip from '../../components/CategoryChip/CategoryChip';
import PostStats from '../../components/PostStats/PostStats';
import myLoader from '../../lib/imageHosterLoader';

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

const doHighlighting = async (highlight, setTitle, setBody) => {
    const parse = await import('html-react-parser').then(m => m.default);

    if(highlight.text_body)
        setBody(parse(highlight.text_body[0]));
    if(highlight.text_title)
        setTitle(parse(highlight.text_title[0]));
}


export default function RowPostcard({ post, author, permlink, highlight}){    

    // (maybe Post Hook) Check if we have all data, else get HIVE Post from API
    if(!post){
        const {data : fetchedPost, error : fetchPostError} = useSWR(`/api/getContent/${author}/${permlink}`, (url)=> fetch(url).then(res => res.json()));
        if(!fetchedPost)
            return <RowPostCardLoading />
            
        return <RowPostcard post={fetchedPost} author={author} permlink={permlink} highlight={highlight}/>           
    }

    const [thumbnailErrors, setThumbnailErrors] = useState(0);
    const metadata = post.json_metadata;
    const thumbnail = getThumbnailImage(metadata, thumbnailErrors);

    // Set Title and Descriptions
    const [title, setTitle] = useState(post.title);
    const [body, setBody] = useState(metadata ? metadata.description : null);

    // Parse Highlights
    useEffect(() =>{
        if(highlight)
            doHighlighting(highlight, setTitle, setBody);

    }, [highlight])

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
                <CardContent sx={{width : "100%"}}>     
                    <Link href={post.url || "#"} passHref>            
                        <CardActionArea> {/* Title, CommunityTag and Description/Body */}
                            <Typography variant="h5" component="h2" sx={{mb : 1}}>                               
                                {post?.title}  
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
                                { metadata?.description }  
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