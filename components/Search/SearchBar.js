import {useEffect, useState} from 'react';
import Router, { useRouter } from 'next/router';
import Link from 'next/link';

import { styled, alpha, useTheme } from '@mui/material/styles';

import { Box, Button, Divider, Grid, InputBase, Typography, FormControl, InputLabel, Input, FormHelperText,Select,MenuItem } from "@mui/material";

import SearchIcon from '@mui/icons-material/Search';

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

const getSearchOptions = (type, queryValue) => {
    if(!type){
        // Just let the user choose the type
        return (
            <Box>
                Filter Search Types: 
                    <Link href={`/search/posts/${queryValue}`} passHref><Button>Posts</Button></Link>
                    
                    <Link href={`/search/accounts/${queryValue}`} passHref><Button>Accounts</Button></Link>
                    
                    <Link href={`/search/stockimages/${queryValue}`} passHref><Button>StockImages</Button></Link>
            </Box>
        )
    }

    if(type === "posts"){
        return (
            <Grid container sx={{m : 1, width : "100%"}} justifyContent="center" spacing={3}>
                <Grid item xs={12} md={3} sx={{p : 3}}>
                    <FormControl variant="standard" sx={{width : "100%"}}>
                        <InputLabel htmlFor="component-simple">By Author</InputLabel>
                        <Input id="component-simple" value={""} 
                            // onChange={handleChange} 
                        />
                    </FormControl>
                </Grid>

                <Grid item xs={12} md={3} sx={{p : 3}}>
                    <FormControl variant="standard" sx={{width : "100%"}}>
                        <InputLabel htmlFor="post-input-tags">Tags to include</InputLabel>
                        <Input
                            id="post-input-tags"
                            value={""}
                            // onChange={handleChange}
                            aria-describedby="post-input-tags-helper"
                        />
                        <FormHelperText id="post-input-tags-helper">
                            Separate multiple tags with spaces
                        </FormHelperText>
                    </FormControl>
                </Grid>

                <Grid item xs={12} md={3} sx={{p : 3}}>
                    <FormControl variant="standard" sx={{width : "100%"}}>
                        <InputLabel htmlFor="post-input-langs">Languages</InputLabel>
                        <Input
                            id="post-input-langs"
                            value={""}
                            // onChange={handleChange}
                            aria-describedby="post-input-langs-helper"
                        />
                        <FormHelperText id="post-input-langs-helper">
                            Country codes separated by spaces
                        </FormHelperText>
                    </FormControl>
                </Grid>

                <Grid item xs={12} md={3} sx={{p : 3}}>
                    <FormControl fullWidth>
                        <InputLabel id="demo-simple-select-label">Sort mode</InputLabel>
                        <Select
                            labelId="demo-simple-select-label"
                            id="demo-simple-select"
                            value={"smart"}
                            label="Sort mode"
                            // onChange={handleChange}
                        >
                            <MenuItem value="smart">Smart</MenuItem>
                            <MenuItem value="relevance">Relevance</MenuItem>
                            <MenuItem value="latest">Latest</MenuItem>
                            <MenuItem value="oldest">Oldest</MenuItem>
                        </Select>
                    </FormControl>
                </Grid>
            </Grid>
        )
    }
}

export default function SearchBar({type, search_query}){
    const router = useRouter();

    const [queryValue, setQueryValue] = useState(search_query);
    const [queryType, setQueryType] = useState(type);

    const onClickGo = () => {
        if(queryValue.length > 0){
            router.push(`/search/${queryType ? (queryType + "/") : ""}${queryValue}`);
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
                            value={queryValue}
                            sx={{width : "100%"}}
                            onChange={(event) => {setQueryValue(event.target.value);}}     
                            onKeyPress={(event) => {if(event.key === "Enter"){onClickGo();}}}                       
                        />
                    </Search>                    

                    {getSearchOptions(type, queryValue)}
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