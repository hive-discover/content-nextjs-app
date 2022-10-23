import useSWR from 'swr';
import { useState } from 'react';
import {useSession} from 'next-auth/react';

import {Box, Container, Divider, Grid, Paper, Skeleton, InputLabel, MenuItem, FormControl, Typography} from '@mui/material';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import SortIcon from '@mui/icons-material/Sort';

import Item from './Item';
import useDiscussion from '../../lib/hooks/hive/useDiscussion';


export default function Comments({post, author, permlink}){
    post = post || {author, permlink};

    const [sortMode, setSortMode] = useState("reward");
    const { data: session } = useSession();
    const {data : comments, pending : commentsLoading, error : commentsError} = useDiscussion({author : post.author, permlink : post.permlink, observer : session?.user?.name, sort : sortMode});

    return(
        <Paper elevation={2} sx={{m : 1, p : 2}}>
            {/* Heading Row */}
            <Box sx={{display : "flex", alignItems : "center", justifyContent : "space-between"}}>
                <h2 id="comments">Comments {post?.children > 0 ? `(${post.children})` : null}</h2>

                <Box sx={{display : "flex", alignItems : "center", float : "right"}}>
                    <SortIcon sx={{mr : 1}}/>
                    <FormControl sx={{ m: 1, minWidth: 120 }}>
                        <Select
                            value={sortMode}
                            onChange={(e) => setSortMode(e.target.value)}
                        >
                            <MenuItem value="newest">Newest</MenuItem>
                            <MenuItem value="oldest">Oldest</MenuItem>
                            <MenuItem value="reward">Reward</MenuItem>
                            <MenuItem value="votes">Votes</MenuItem>
                            <MenuItem value="reputation">Reputation</MenuItem>
                        </Select>
                    </FormControl>
                </Box>
            </Box>

            {/* Comments */}
            {
                !commentsLoading && !commentsError && comments ? comments.map(c => <><Divider sx={{mt : 1, mb : 1}}/><Item comment={c}/></>) : null
            }

        </Paper>
    )
}