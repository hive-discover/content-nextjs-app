import Link from 'next/link';
import {useState} from 'react';
import {useSession} from 'next-auth/react';
import dynamic from 'next/dynamic';

import getDate from '../../lib/niceTimestamp';

import { styled } from '@mui/material/styles';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import {Avatar, Stack, Box, Divider, Typography, Skeleton, Slider, Button} from '@mui/material'
import Tooltip, { tooltipClasses } from '@mui/material/Tooltip';

import Forum from '@mui/icons-material/Forum';
import Favorite from '@mui/icons-material/Favorite'
import PresentToAll from '@mui/icons-material/PresentToAll'
import AttachMoney from '@mui/icons-material/AttachMoney'
import PriceCheck from '@mui/icons-material/PriceCheck'
import ThumbUpOffAlt from '@mui/icons-material/ThumbUpOffAlt';
import ThumbDownAlt from '@mui/icons-material/ThumbDownAlt';
import ThumbDownOffAlt from '@mui/icons-material/ThumbDownOffAlt';
import Close from '@mui/icons-material/Close';

const ProfileRowCard = dynamic(() => import('../../components/ProfileRowCard/ProfileRowCard'), {ssr: false});


const getPayOut = (post, imgProps) => {
    if(post.is_paidout){
        const [author_payout_value, currency] = post.author_payout_value.split(" ")
        const curator_payout_value = post.curator_payout_value.split(" ")[0]

        const total = (parseFloat(author_payout_value) + parseFloat(curator_payout_value)).toFixed(3);

        return [<PriceCheck {...imgProps} key={1}/>, `${total} ${currency}`];      
    } else {
        const pending_payout_value = post.pending_payout_value;

        return [<AttachMoney {...imgProps} key={1}/>, pending_payout_value]; 
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

    const src = `https://images.hive.blog/u/${author}/avatar/small`;
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

import {broadcastVote} from '../../lib/broadcastTrx';

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
            <Typography variant="caption">
                <Box sx={{display : "flex", justifyContent : "space-between", alignItems : "center", flexWrap : "nowrap"}}>
                    {AuthorToolTip(post.author)}

                    {/* Show date when it is a big display */}
                    {getDate(post.created)}                               
                </Box>
                <Box sx={{display : "flex", justifyContent : "space-between", alignItems : "center", flexWrap : "nowrap"}}>
                    <Divider orientation='vertical' sx={{ml : 0.5, mr : 0.5}} flexItem/>
                    <Favorite fontSize={"medium"} color={hisVote === "up" ? "primary" : "inherit"} onClick={onClickVote}/> &nbsp;&nbsp; {post.stats ? post.stats.total_votes : null}                           
                    {hisVote === "down" ? <ThumbDownAlt fontSize={"medium"} color="secondary" /> : null}
                    <Divider orientation='vertical' sx={{ml : 0.5, mr : 0.5}} flexItem/>
                    <Link href={post.url + "#comments"} passHref><Forum fontSize={"medium"} /></Link> &nbsp;&nbsp; {post.children}
                    <Divider orientation='vertical' sx={{ml : 0.5, mr : 0.5}} flexItem/>
                    <PresentToAll fontSize={"medium"} /> &nbsp;&nbsp; {post && post.reblogged_by ? post.reblogged_by.length : 0}
                    <Divider orientation='vertical' sx={{ml : 0.5, mr : 0.5}} flexItem/>
                    {getPayOut(post, {fontSize : "medium"})}
                    <Divider orientation='vertical' sx={{ml : 0.5, mr : 0.5}} flexItem/>
                </Box>
            </Typography>


            {/* Vote Options */}
            { !hisVote && openVoteMenue && session ? 
                (<Stack spacing={2} direction="row" sx={{ mt: 2}} alignItems="center" justifyItems="center">
                    <Button variant="outlined" color="info" onClick={onClickUpvote}><ThumbUpOffAlt /></Button>
                    <Slider valueLabelDisplay="auto" value={voteWeight} onChange={(event, newValue) => {setVoteWeight(newValue);}}/>
                    <Button variant="outlined" color="error" onClick={onClickDownvote}><ThumbDownOffAlt /></Button>
                    <Divider variant="middle" orientation='vertical' sx={{ml : 0.5, mr : 0.5}} flexItem/>
                    <Button variant="outlined" color="primary" onClick={()=>{setOpenVoteMenue(false)}} title="Cancel vote"><Close/></Button>
                </Stack>
                ) : null
            }
        </Box>
    )
}