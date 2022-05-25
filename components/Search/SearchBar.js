import {useState} from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import dynamic from 'next/dynamic';

import { styled, alpha } from '@mui/material/styles';

import { Box, Button, Divider, CircularProgress, Grid, InputBase, Typography } from "@mui/material";
import SearchIcon from '@mui/icons-material/Search';

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

const getSearchOptions = (type, queryValue, setQueryValue, onClickGo) => {
    switch(type){
        case "posts":
            return <PostSearchForm queryValue={queryValue} setQueryValue={setQueryValue} onClick={onClickGo} />
        case "accounts":
            return null;
        case "stockimages":
            return null;
        default:
            return (
                <Box>
                    Filter Search Types: 
                        <Link href={`/search/posts/${queryValue.query}`} passHref><Button>Posts</Button></Link>
                        
                        <Link href={`/search/accounts/${queryValue.query}`} passHref><Button>Accounts</Button></Link>
                        
                        <Link href={`/search/stockimages/${queryValue.query}`} passHref><Button>StockImages</Button></Link>
                </Box>
            );
    }
}

export default function SearchBar({type, search_query}){
    const router = useRouter();

    const [queryValue, setQueryValue] = useState(search_query);

    const onClickGo = () => {
        let params = [];
        if(queryValue.authors && queryValue.authors.length > 0){
            params.push(`authors=${queryValue.authors.join(",")}`);
        }
        if(queryValue.tags && queryValue.tags.length > 0){
            params.push(`tags=${queryValue.tags.join(",")}`);
        }
        if(queryValue.parent_permlinks && queryValue.parent_permlinks.length > 0){
            params.push(`parent_permlinks=${queryValue.parent_permlinks.join(",")}`);
        }

        if(queryValue.query.length > 0){
            router.push(`/search/${type ? (type + "/") : ""}${params.length > 0 ? params.join("/") + "/" : ""}${queryValue.query}`);
        }
    }
    
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
                            onKeyPress={(event) => {if(event.key === "Enter"){onClickGo();}}}                       
                        />
                    </Search>                    

                    {getSearchOptions(type, queryValue, setQueryValue, onClickGo)}
                </Grid>

                <Grid item xs={12} sx={{display : "flex", alignItems : "center", justifyContent : "center"}}>
                    {
                        type ? (<Link href="/search/" passHref><Button variant="outlined" sx={{mt : 3,width : "40vh"}}>Return</Button></Link>) : null
                    }
                    <Button variant="contained" color="primary" sx={{mt : 3, width : "40vh"}} onClick={onClickGo}>Go!</Button>
                </Grid>
            </Grid>
        </Box>
    );
}