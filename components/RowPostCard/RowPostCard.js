import Link from 'next/link';
import useSWR from 'swr';
import {useState, useEffect} from 'react';
import {useSession} from 'next-auth/react';
import Image from 'next/image';
import moment from 'moment';
import parse from 'html-react-parser';

import { styled } from '@mui/material/styles';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import {Avatar, Badge, Chip, Box, Divider, Grid, CardContent, CardActionArea, Typography, Skeleton} from '@mui/material'
import Tooltip, { tooltipClasses } from '@mui/material/Tooltip';

import Forum from '@mui/icons-material/Forum';
import Favorite from '@mui/icons-material/Favorite'
import PresentToAll from '@mui/icons-material/PresentToAll'
import AttachMoney from '@mui/icons-material/AttachMoney'
import PriceCheck from '@mui/icons-material/PriceCheck'

import RowPostCardLoading from './RowPostCardLoading';
import CategoryChip from '../../components/CategoryChip/CategoryChip';
import ProfileRowCard from '../ProfileRowCard/ProfileRowCard';


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

const getPayOut = (post) => {
    if(post.is_paidout){
        const [author_payout_value, currency] = post.author_payout_value.split(" ")
        const curator_payout_value = post.curator_payout_value.split(" ")[0]

        const total = (parseFloat(author_payout_value) + parseFloat(curator_payout_value)).toFixed(3);

        return [<PriceCheck />, `${total} ${currency}`];      
    } else {
        const pending_payout_value = post.pending_payout_value;

        return [<AttachMoney />, pending_payout_value]; 
    }
}

const checkIfVotes = (post, session) => {
    if(!post || !session || !post.active_votes)
        return false;

    const possibleIndex = post.active_votes.findIndex(vote => vote.voter === session.user.name);
    return possibleIndex > -1;
}

const CustomWidthTooltip = styled(({ className, ...props }) => (
    <Tooltip {...props} classes={{ popper: className }} enterTouchDelay={0} />
  ))({
    [`& .${tooltipClasses.tooltip}`]: {
      maxWidth: 650,
      minWidth : 300
    },
  });

const AuthorToolTip = (author) => { 
    if(!author)
        return <Skeleton variant="circle" width={15} height={15} />

    const src = `/api/imageProxy?imageUrl=https://images.hive.blog/u/${author}/avatar/small`;
    return (
        <CustomWidthTooltip 
            title={<ProfileRowCard username={author} clickable={true}/>}
        >
            <p style={{display : "flex", alignItems : "center", justifyContent : "center"}}>       
                <Link href={`/u/@${author}`} passHref>
                    <Box sx={{display : "flex", alignItems : "center"}}><Avatar src={src} alt="" width={15} height={15} />
                    &nbsp;&nbsp;&nbsp;@{author} &nbsp;&nbsp;&nbsp;</Box>
                </Link>
            </p>
        </CustomWidthTooltip>
    )
}

const getDate = (created) => {
    return moment(created, "YYYY-MM-DDThh:mm:ss").calendar({
        sameDay: '[Today]',
        nextDay: '[Tomorrow]',
        nextWeek: 'dddd',
        lastDay: '[Yesterday]',
        lastWeek: '[Last] dddd',
        sameElse: 'DD/MM/YYYY'
    });
}

export default function RowPostcard({ post, author, permlink, highlight}){    
    // Data Hooks
    const { data: session } = useSession()

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

                    {/* Author, Votes, Replies and Date */}
                    <Typography variant="caption" sx={{display : "flex", alignItems : "center", flexWrap : "wrap", justifyContent : "space-between"}}>
                        {AuthorToolTip(post.author)}

                        {/* Show date when it is a big display */}
                        <Box sx={{display : {xs : "block", sm : "none"}}}>
                            {getDate(post.created)}                               
                        </Box>

                        {/* Line Breaker */}
                        <Box sx={{width : {xs : "100%", sm : 0}}}></Box>

                        <Divider variant="middle" orientation='vertical' sx={{ml : 0.5, mr : 0.5}} flexItem/>
                        <Favorite color={checkIfVotes(post, session) ? "primary" : "inherit"}/> &nbsp;&nbsp; {post.stats ? post.stats.total_votes : null}
                        <Divider variant="middle" orientation='vertical' sx={{ml : 0.5, mr : 0.5}} flexItem/>
                        <Forum /> &nbsp;&nbsp; {post.children}
                        <Divider variant="middle" orientation='vertical' sx={{ml : 0.5, mr : 0.5}} flexItem/>
                        <PresentToAll /> &nbsp;&nbsp; {post && post.reblogged_by ? post.reblogged_by.length : 0}
                        <Divider variant="middle" orientation='vertical' sx={{ml : 0.5, mr : 0.5}} flexItem/>
                            {getPayOut(post)}
                        <Divider variant="middle" orientation='vertical' sx={{ml : 0.5, mr : 0.5}} flexItem/>
                    </Typography>
                
                </CardContent>
            </Grid>
        </Grid>
    );
}