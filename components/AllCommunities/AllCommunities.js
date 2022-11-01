import {useSession} from "next-auth/react";
import useListCommunities from "../../lib/hooks/hive/useListCommunities";
import {useState} from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import dynamic from 'next/dynamic';

import { styled, alpha } from '@mui/material/styles';

import { Box, Button, Divider, CircularProgress, Grid, InputBase, Typography } from "@mui/material";
import SearchIcon from '@mui/icons-material/Search';

import CommunityColumnCard from "../CommunityColumnCard/CommunityColumnCard";

const Search = styled('div')(({ theme }) => ({
    position: 'relative',
    display : "flex",
    borderRadius: theme.shape.borderRadius,
    backgroundColor: alpha(theme.palette.common.white, 0.15),
    '&:hover': {
      backgroundColor: alpha(theme.palette.common.white, 0.25),
    },
    marginLeft: 0,
    width: '100%',
}));
  
const SearchIconWrapper = styled('div')(({ theme }) => ({
    padding: theme.spacing(0, 2),
    height: '100%',
    position: 'absolute',
    pointerEvents: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
}));
  
const StyledInputBase = styled(InputBase)(({ theme }) => ({
    color: 'inherit',
        '& .MuiInputBase-input': {
            padding: theme.spacing(1, 1, 1, 0),
            // vertical padding + font size from searchIcon
            paddingLeft: `calc(1em + ${theme.spacing(4)})`,
            transition: theme.transitions.create('width'),
            width: '100%',            
        },
}));

export default function LoggedInMenue() {

    const {data : session} = useSession();
    const [query, setQuery] = useState(null);
    const {data : communities, error : communitiesError} = useListCommunities({limit : 50, sort : "rank", query : query, observer : session?.user.name});

    return (
        <>
            <h2>
                All Communities - Ranked
            </h2>
            <Divider />

            <br/> 

            <Search>
                <SearchIconWrapper>
                    <SearchIcon />
                </SearchIconWrapper>
                <StyledInputBase
                    placeholder="Search…"
                    inputProps={{ 'aria-label': 'search' }}
                    value={query}
                    sx={{width : "100%"}}
                    onChange={(event) => {setQuery(event.target.value.length > 0 ? event.target.value : null);}}     
                />
            </Search> 

            <br/>
            <Grid container spacing={2} alignItems="stretch" display="flex">
                {
                    communities && communities.map((community, index) => (
                        <Grid item xs={12} sm={6} md={4} lg={3} sx={{height : "100%"}}key={index} >
                            <CommunityColumnCard community={community} sx={{height : "100%"}} />
                        </Grid>
                    ))
                }
            </Grid>
        </>
    )
}