import {useEffect, useState} from 'react';
import dynamic from 'next/dynamic'
import { useRouterScroll } from '@moxy/next-router-scroll';

// import { Box, Container, Divider } from "@mui/material";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Divider from "@mui/material/Divider";

import SearchBar from "../../components/Search/SearchBar";

const PostResults = dynamic(() => import("../../components/Search/PostResults"));
const AccountResults = dynamic(() => import("../../components/Search/AccountResults"));
const StockImageResults = dynamic(() => import("../../components/Search/StockImageResults"));

const types = ["posts", "accounts", "stockimages"]


export default function Search({search_query, type}) {

    const { updateScroll } = useRouterScroll();

    useEffect(()=>{
        if(search_query && type)
            updateScroll();
    }, [search_query, type])

    return (
        <Container sx={{minHeight : "80vh"}}>
            <Box sx={{mb : {xs : 5, sm : 7, md : 10}, mt : {xs : 3, sm : 4, md : 10}}}>
                <SearchBar type={type} search_query={search_query} sx={{width : "100%"}}/>
            </Box>
            
            <Divider variant="middle" flexItem/>

            {
                search_query && (!type || type === "posts") ? <PostResults search_query={search_query} visiblePostsCount={type !== "posts" ? 3 : null}/> : null
            }

            {
                search_query && (!type || type === "accounts") ? <AccountResults search_query={search_query} visibleAccountsCount={type !== "accounts" ? 6 : null}/> : null
            }

            {
                search_query && (!type || type === "stockimages") ? <StockImageResults search_query={search_query} visiblePostsCount={type !== "stockimages" ? 6 : null}/> : null
            }

        </Container>
    );
}


// Rules:
// 1. The Type-Filter for Posts/Accounts/StockImages must be the first item in the array (e.g. /search/posts/[other])
// 2. The Search Query is the last item in the URL (e.g. /search/foo/bar/[query] or /search/[query])
  
export async function getServerSideProps(context) {   
    const params = context.query.params || [];    
    if(params.length === 0) // No params, redirect to search bar
        return {props : {}};
    
    let props = {};

    // Parse params in the URL-Route
    // * Search-type
    if(types.includes(params[0]))
        props.type = params[0];

    // * Search-query
    props.search_query = {query : !types.includes(params[params.length - 1]) ? params[params.length - 1] : ""};
    params.forEach((param, index) => {
        const [key, value] = param.split("=");
        switch(key){
            case "query": 
                props.search_query.query = value; 
                break;
            case "page":
                props.search_query.page = value;
                break;
            case "authors":
                props.search_query.authors = value.length > 2 ? value.split(",") : null;
                break;
            case "tags":
                props.search_query.tags = value.length > 2 ? value.split(",") : null;
                break;
            case "parent_permlinks":
                props.search_query.parent_permlinks = value.length > 2 ? value.split(",") : null;
                break;
        }    
    })

    // Add the querystring also to the props
    props = {...context.query, ...props, rndValue : Math.random()};

    return {
        props
    };
}