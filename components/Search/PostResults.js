import { createHmac } from 'crypto';
import useSwr from 'swr';
import {useState, useEffect} from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';

import { Button, Box, CircularProgress, Pagination, Typography } from '@mui/material';

const BigPostContainer = dynamic(() => import('../../components/BigPostContainer/BigPostContainer'), {ssr: false, loading: () => <center><CircularProgress sx={{m : 5}}/></center>});

const fetchSearch = async ({searchBody}) => {
    const url = "https://api.hive-discover.tech/v1/search/posts";
    const res = await fetch(url, {method : "POST", body : JSON.stringify(searchBody), headers : {'Content-Type' : 'application/json'}}).then(res => res.json());
    
    if(res.status !== "ok"){
        const error = new Error("An error occurred while fetching the data.");
        error.response = res;
        throw error;
    }
    
    return res;
}

export default function PostResults(props){

    const {search_query, visiblePostsCount} = props;
    const searchHash = createHmac('sha256', JSON.stringify(search_query)).digest('hex');
    const [pageNumber, setPageNumber] = useState(1);

    const amountPerPage = 25;
    const searchBody = {...search_query, amount : visiblePostsCount ? visiblePostsCount : amountPerPage, highlight : true, page_number : pageNumber};
    const {data : searchResult, error : searchError} = useSwr({searchBody, searchHash, pageNumber}, fetchSearch);
    const isLoading = !searchResult && searchError !== null;


    const matched_docs = (searchResult && searchResult.total_matched_docs && searchResult.total_matched_docs > 0) ? Math.min(searchResult.total_matched_docs) : -1;
    const showPagination = matched_docs > amountPerPage && !isLoading && !visiblePostsCount

    return (
        <Box sx={{width : "100%"}}>
            <br/>
            <Typography variant="h4">Post - Search Results</Typography>
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
            
            <BigPostContainer 
                posts={searchResult ? searchResult.posts : null} 
                isLoading={isLoading}
            />
        
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
        </Box>
    )
}