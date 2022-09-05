import {useEffect, useState} from 'react';
import dynamic from 'next/dynamic'
import { useRouterScroll } from '@moxy/next-router-scroll';
import {useRouter} from 'next/router';

// import { Box, Container, Divider } from "@mui/material";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Divider from "@mui/material/Divider";
import CircularProgress from '@mui/material/CircularProgress';

import SearchBar from "../../components/Search/SearchBar";

const PostResults = dynamic(() => import("../../components/Search/PostResults"), {ssr: false, loading: () => <center><CircularProgress sx={{m : 5}}/></center>});
const AccountResults = dynamic(() => import("../../components/Search/AccountResults"), {ssr: false, loading: () => <center><CircularProgress sx={{m : 5}}/></center>});
const StockImageResults = dynamic(() => import("../../components/Search/StockImageResults"), {ssr: false, loading: () => <center><CircularProgress sx={{m : 5}}/></center>});

const types = ["posts", "accounts", "stockimages"]

// Rules:
// 1. The Type-Filter for Posts/Accounts/StockImages must be the first item in the array 
// 2. The Search-Options are in between the Type-Filter and the Search-Query
// 3. The Search Query is the last item in the URL 
//  ==> e.g. "/search/[query]" "/search/posts/[query]" "/search/foo=bar/[query]" 

const getSearchMeta = (params) => {

    if(!params || params.length === 0) 
        return {type : null, query : null, options : null}; // e.g. "/search"

    if(params.length === 1){
        const val = params[0];

        if(types.includes(val))
            return {type : val, query : null, options : null}; // e.g. "/search/posts"
        else 
            return {type : null, query : val, options : null}; // e.g. "/search/foo"
    }

    if(params.length === 2)
        return {type : params[0], query : params[1], options : null}; // e.g. "/search/posts/foo"


    // params.length > 2 | e.g. "/search/posts/foo=bar/foobar"
    const [type, ...options] = params;
    const query = options.pop();
    return {
        type, query,
        options : Object.fromEntries(options.map(o => {
            const [key, val] = o.split("=");
            return [key, val.split(",")];
        }))
    }
}

export default function Search() {

    const router = useRouter();
    const { updateScroll } = useRouterScroll();
    
    const {type, query, options} = getSearchMeta(router?.query?.params);

    useEffect(()=>{
        if(router.isReady)
            updateScroll();
    }, [router.isReady])

    if(!router.isReady)
        return <center><CircularProgress /> </center>

    return (
        <Container sx={{minHeight : "80vh"}}>
            <Box sx={{mb : {xs : 5, sm : 7, md : 10}, mt : {xs : 3, sm : 4, md : 10}, minHeight : query ? null : "80vh"}}>
                <SearchBar pre_type={type} pre_query={query} pre_options={options} sx={{width : "100%"}}/>
            </Box>
            
            <Divider variant="middle" flexItem/>

            {
                query && (!type || type === "posts") ? <PostResults query={query} options={options} visiblePostsCount={type !== "posts" ? 3 : null}/> : null
            }

            {
                query && (!type || type === "accounts") ? <AccountResults query={query} options={options} visibleAccountsCount={type !== "accounts" ? 6 : null}/> : null
            }

            {
                query && (!type || type === "stockimages") ? <StockImageResults query={query} options={options} visiblePostsCount={type !== "stockimages" ? 3 : null}/> : null
            }

        </Container>
    );
}