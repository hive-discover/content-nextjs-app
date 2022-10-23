import useSWR from 'swr';
import { useState, useEffect } from 'react';
import {useSession} from 'next-auth/react';

import {Box, Container, Divider, Grid, Paper, Skeleton, InputLabel, MenuItem, FormControl, Typography} from '@mui/material';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import SortIcon from '@mui/icons-material/Sort';

import PostStats from '../../components/PostStats/PostStats';
import useDiscussion from '../../lib/hooks/hive/useDiscussion';

const parseCommentBody = async (body, setBody) => {
    if(!body) return null;

    const parse = await import('html-react-parser').then(m => m.default);
    setBody(parse(body));
}

export default function Item({comment, depth = 0}){
    if(depth > 5) return null;

    // Parse Body 
    const [commentBody, setCommentBody] = useState(null);
    useEffect(()=>{
        if(comment?.body){
            parseCommentBody(comment.body, setCommentBody)
        }
    }, [comment])

    // Show deeper comments
    const { data: session } = useSession();
    const {data : replies, pending : repliesLoading, error : repliesError} = useDiscussion({author : comment.author, permlink : comment.permlink, observer : session?.user?.name, sort : "newest"});


    return( 
        <Box>
            

            {/* Reply Information */}
            <Box sx={{display : "flex", flexDirection : "column", alignItems : "flex-start"}}>
                <PostStats post={comment} replyInfo={true}/>
            </Box>

            <Typography variant="body1">
                {commentBody ? commentBody : <><Skeleton variant="text" width="100%" /><Skeleton variant="text" width="100%" /><Skeleton variant="text" width="100%" /></>}
            </Typography>

            {/* Replies */}
            <Box sx={{ml : 12}}>
                {
                    !repliesLoading && !repliesError && replies ? replies.map(c => 
                    <Box sx={{borderLeft : "dashed gray", pl : 3}}>
                        <Item comment={c} depth={depth + 1}/>
                    </Box>) : null
                }
            </Box>
        </Box>
    );
}