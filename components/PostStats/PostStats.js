import Link from 'next/link';
import {useState, useEffect} from 'react';
import {useSession} from 'next-auth/react';
import getDate from '../../lib/niceTimestamp';

import { styled } from '@mui/material/styles';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import {Avatar, Stack, Box, Divider, Typography, Skeleton, Slider, Button} from '@mui/material'
import Tooltip, { tooltipClasses } from '@mui/material/Tooltip';
import { Notify } from 'notiflix/build/notiflix-notify-aio';

import Forum from '@mui/icons-material/Forum';
import Favorite from '@mui/icons-material/Favorite'
import PresentToAll from '@mui/icons-material/PresentToAll'
import AttachMoney from '@mui/icons-material/AttachMoney'
import PriceCheck from '@mui/icons-material/PriceCheck'
import ThumbUpOffAlt from '@mui/icons-material/ThumbUpOffAlt';
import ThumbDownAlt from '@mui/icons-material/ThumbDownAlt';
import ThumbDownOffAlt from '@mui/icons-material/ThumbDownOffAlt';

import ProfileRowCard from '../../components/ProfileRowCard/ProfileRowCard';
import Close from '@mui/icons-material/Close';


const getPayOut = (post, imgProps) => {
    if(post.is_paidout){
        const [author_payout_value, currency] = post.author_payout_value.split(" ")
        const curator_payout_value = post.curator_payout_value.split(" ")[0]

        const total = (parseFloat(author_payout_value) + parseFloat(curator_payout_value)).toFixed(3);

        return [<PriceCheck {...imgProps}/>, `${total} ${currency}`];      
    } else {
        const pending_payout_value = post.pending_payout_value;

        return [<AttachMoney {...imgProps}/>, pending_payout_value]; 
    }
}

const checkHowVoted = (post, session) => {
    if(!post || !session || !post.active_votes)
        return null; // Post not ready / not found

    const possibleIndex = post.active_votes.findIndex(vote => vote.voter === session.user.name);
    if(possibleIndex === -1) 
        return null; // Not voted

    // We got a vote: check if up/down
    return post.active_votes[possibleIndex].rshares < 0 ? "down" : "up";
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

const broadcastVote = async (session, author, permlink, weight) => {
    // Prepare POST Request
    const header = {
        'Content-Type' : 'application/json',
        'Authorization': session.accessToken
    }
    const request_body = {"operations" : [["vote", {
        author : author,
        permlink : permlink,
        voter : session.user.name,
        weight : weight
    }]]}


    const success = await fetch("https://hivesigner.com/api/broadcast", {method : "POST", headers : header, body : JSON.stringify(request_body)})
        .then(response => response.json())
        .then(response => new Promise((resolve, reject) => {
            if(response.result && response.result.id)
                return resolve(true); // Success
                
            reject(response.response.message || "Error on Broadcasting Vote");
        }))
        .catch((error) => {
            console.log("Error on Broadcasting Vote", error);
            Notify.failure(`Error on Broadcasting Vote: ${error}`, {timeout: 5000, position : "right-bottom", clickToClose : true, passOnHover : true});
            return false;
        });

    return success;
}

export default function PostStats({post}){
    const theme = useTheme();
    const upMD = useMediaQuery(theme.breakpoints.up('md'));
    const upSM = useMediaQuery(theme.breakpoints.up('sm'));

    const { data: session } = useSession()
    const [hisVote, setHisVote] = useState(checkHowVoted(post, session));
    const [openVoteMenue, setOpenVoteMenue] = useState(false);
    const [voteWeight, setVoteWeight] = useState(50);

    const onClickVote = async () => {
        if(hisVote || !session) return; // We cannot double-vote or not logged in
        if(openVoteMenue){
            // Is doubleclick ==> upvote 100%
            const success = await broadcastVote(session, post.author, post.permlink, 10000)
            if(success)
                setHisVote("up");
        }

        // Toggle menue to open or close when it is a double click
        setOpenVoteMenue(!openVoteMenue);
    }

    const onClickUpvote = async () => {
        const success = await broadcastVote(session, post.author, post.permlink, voteWeight * 100)
        if(success)
            setHisVote("up");
    };

    const onClickDownvote = async () => {
        const success = await broadcastVote(session, post.author, post.permlink, voteWeight * -100)
        if(success)
            setHisVote("down");
    };

    if(!post) // Show loading
        return <Skeleton width={"100%"} height={"64px"} />

    return (
        <Box>
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
                <Favorite fontSize={upSM ? "medium" : "large"} color={hisVote === "up" ? "primary" : "inherit"} onClick={onClickVote}/> &nbsp;&nbsp; {post.stats ? post.stats.total_votes : null}                           
                {hisVote === "down" ? <ThumbDownAlt fontSize={upSM ? "medium" : "large"} color="secondary" /> : null}
                <Divider variant="middle" orientation='vertical' sx={{ml : 0.5, mr : 0.5}} flexItem/>
                <Link href={post.url + "#comments"} scroll={false} passHref><Forum fontSize={upSM ? "medium" : "large"} /></Link> &nbsp;&nbsp; {post.children}
                <Divider variant="middle" orientation='vertical' sx={{ml : 0.5, mr : 0.5}} flexItem/>
                <PresentToAll fontSize={upSM ? "medium" : "large"} /> &nbsp;&nbsp; {post && post.reblogged_by ? post.reblogged_by.length : 0}
                <Divider variant="middle" orientation='vertical' sx={{ml : 0.5, mr : 0.5}} flexItem/>
                    {getPayOut(post, {fontSize : upSM ? "medium" : "large"})}
            </Typography>


            {/* Vote Options */}
            { !hisVote && openVoteMenue && session ? 
                (<Stack spacing={2} direction="row" sx={{ mt: 2}} alignItems="center" justifyItems="center">
                    <Button variant="outlined" color="info" onClick={onClickUpvote}><ThumbUpOffAlt /></Button>
                    <Slider valueLabelDisplay="auto" value={voteWeight} onChange={(event, newValue) => {setVoteWeight(newValue);}} sx={{minWidth : "200px"}}/>
                    <Button variant="outlined" color="error" onClick={onClickDownvote}><ThumbDownOffAlt /></Button>
                    <Divider variant="middle" orientation='vertical' sx={{ml : 0.5, mr : 0.5}} flexItem/>
                    <Button variant="outlined" color="primary" onClick={()=>{setOpenVoteMenue(false)}} title="Cancel vote"><Close/></Button>
                </Stack>
                ) : null
            }
        </Box>
    )
}