import { useState } from 'react';
import useSWRImmutable from 'swr/immutable'
import Link from 'next/link'

import { Button, Box, Pagination, Typography } from '@mui/material';

import PhotoPostsContainer from "../PhotoPostsContainer/PhotoPostsContainer";

const fetchSearch = ({searchBody}) => fetch(
        `https://api.hive-discover.tech/v1/images/text`, 
        {method : "POST", body : JSON.stringify(searchBody), headers : {'Content-Type' : 'application/json'}}
    ).then(res => res.json());

const amountPerPage = 15;

export default function StockImageResults({search_query, visiblePostsCount}){
    const [pageNumber, setPageNumber] = useState(1);

    // Build search body and run search
    const searchBody = {...search_query, amount : visiblePostsCount ? visiblePostsCount : amountPerPage, page_number : pageNumber};
    const {data : searchResult, error : searchError} = useSWRImmutable({searchBody, pageNumber}, fetchSearch);
    const isLoading = !searchResult && searchError !== null;

    const matched_docs = searchResult?.total || -1;
    const showPagination = matched_docs > amountPerPage && !isLoading && !visiblePostsCount

    return (
        <Box>
            <br/>
            <Typography variant="h4">Stock Images - Search Results</Typography>
            {searchResult ? <Typography variant="subtitle" sx={{mb : 3}}>Showing {searchResult.posts.length} {matched_docs > 0 ? ` of ${matched_docs} ` : null} posts in {searchResult.time}s</Typography> : null}
            
            {showPagination ? <Box sx={{display : "flex", justifyContent : "center", p : 5}}>
                <Pagination 
                    count={Math.round(matched_docs / amountPerPage)} 
                    showFirstButton 
                    variant="outlined" 
                    shape="rounded" 
                    size="large"
                    page={pageNumber}
                    id="top-post-navigation"
                    onChange={(event, value)=>{setPageNumber(value);}}
                />
            </Box> : null}
            
        
            <PhotoPostsContainer posts={searchResult?.posts} isLoading={isLoading} loadingAmount={visiblePostsCount}/>

            {showPagination ? <Box sx={{display : "flex", justifyContent : "center", p : 5}}>
                <Pagination 
                    count={Math.round(matched_docs / amountPerPage)}
                    showFirstButton 
                    variant="outlined" 
                    shape="rounded" 
                    size="large"
                    page={pageNumber}
                    id="bottom-post-navigation"
                    onChange={(event, value)=>{setPageNumber(value); document.getElementById("top-post-navigation").scrollIntoView();}}
                />
            </Box> : null}

            {
                visiblePostsCount > 0 && matched_docs > visiblePostsCount && !isLoading  
                ? <center><Link href={`/search/posts/${search_query.query}`}><Button variant="contained">View All Results</Button></Link></center> : null
            }
            
            <br/>
        </Box>
    )
}