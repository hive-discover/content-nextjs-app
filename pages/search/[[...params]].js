import dynamic from 'next/dynamic'

// import { Box, Container, Divider } from "@mui/material";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Divider from "@mui/material/Divider";

import SearchBar from "../../components/Search/SearchBar";

const PostResults = dynamic(() => import("../../components/Search/PostResults"));
const AccountResults = dynamic(() => import("../../components/Search/AccountResults"));

const types = ["posts", "accounts", "stockimages"]


export default function Search({search_query, type}) {

    return (
        <Container sx={{minHeight : "80vh", display : "flex", alignItems : "center", justifyContent : "center", flexWrap : "wrap"}}>
            <Box sx={{mb : {xs : 5, sm : 7, md : 10}, mt : {xs : 3, sm : 4, md : 10}}}>
                <SearchBar type={type} search_query={search_query} sx={{width : "100%"}}/>
            </Box>
            
            <Divider variant="middle" flexItem/>

            {
                search_query && (!type || type === "posts") ? <PostResults search_query={search_query} visiblePostsCount={type !== "posts" ? 6 : null}/> : null
            }

            {
                search_query && (!type || type === "accounts") ? <AccountResults search_query={search_query} visibleAccountsCount={type !== "accounts" ? 6 : null}/> : null
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
    if(!types.includes(params[params.length - 1]))
        props.search_query = params[params.length - 1];

    // Add the querystring also to the props
    props = {...context.query, ...props, rndValue : Math.random()};

    return {
        props
    };
}