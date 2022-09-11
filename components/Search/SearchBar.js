import {useState} from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import dynamic from 'next/dynamic';

import { styled, alpha } from '@mui/material/styles';

import { Box, Button, Divider, CircularProgress, Grid, InputBase, Typography } from "@mui/material";
import SearchIcon from '@mui/icons-material/Search';

import {onClickGo} from '../../lib/search';

const PostSearchForm = dynamic(() => import('./PostSearchForm'), {ssr: false, loading: () => <center><CircularProgress sx={{m : 5}}/></center>});

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

const getSearchOptions = (type, queryValue, setQueryValue) => {
    switch(type){
        case "posts":
            return <PostSearchForm queryValue={queryValue} setQueryValue={setQueryValue} />
        case "accounts":
            return null;
        case "stockimages":
            return null;
        default:
            return (
                <Box>
                    Filter Search Types: 
                        <Link href={onClickGo(null, queryValue, "posts")} passHref><Button>Posts</Button></Link>
                        
                        <Link href={onClickGo(null, queryValue, "accounts")} passHref><Button>Accounts</Button></Link>
                        
                        <Link href={onClickGo(null, queryValue, "stockimages")} passHref><Button>StockImages</Button></Link>
                </Box>
            );
    }
}

export default function SearchBar({pre_type, pre_query, pre_options}){
    const router = useRouter();
    const [queryValue, setQueryValue] = useState({type : pre_type, options : pre_options, query : pre_query});
    
    return (
        <Box sx={{width : "100%"}}>
            <Grid container>
                <Grid item xs={12}>
                    <Typography component="h3" variant="h3">
                        Search on HIVE
                    </Typography>
                    <Typography component="h3" variant="subtitle">
                        Posts, Accounts, StockImages - all in one place
                    </Typography>
                </Grid>

                <Divider sx={{mb : 5}} variant="middle" flexItem/>

                <Grid item xs={12} sx={{pl : {sm : 2, md : 3}, pr : {sm : 2, md : 3}}}>
                    <Search>
                        <SearchIconWrapper>
                            <SearchIcon />
                        </SearchIconWrapper>
                        <StyledInputBase
                            placeholder="Search…"
                            inputProps={{ 'aria-label': 'search' }}
                            value={queryValue?.query}
                            sx={{width : "100%"}}
                            onChange={(event) => {setQueryValue({...queryValue, query : event.target.value });}}     
                            onKeyPress={(event) => {if(event.key === "Enter"){onClickGo(router, queryValue, pre_type);}}}                       
                        />
                    </Search>                    

                    {getSearchOptions(pre_type, queryValue, setQueryValue)}
                </Grid>

                <Grid item xs={12} sx={{display : "flex", alignItems : "center", justifyContent : "center"}}>
                    {
                        pre_type ? (<Link href="/search/" passHref><Button variant="outlined" sx={{mt : 3,width : "40vh"}}>Return</Button></Link>) : null
                    }
                    <Button variant="contained" color="primary" sx={{mt : 3, width : "40vh"}} onClick={() => {queryValue.type = null; onClickGo(router, queryValue, pre_type)}}>Go!</Button>
                </Grid>
            </Grid>
        </Box>
    );
}