import { createHmac } from 'crypto';
import useSwr from 'swr';
import {useState, useEffect} from 'react';
import { useRouter } from 'next/router';

import { Box, Pagination, Typography } from '@mui/material';

import BigPostContainer from "../../components/BigPostContainer/BigPostContainer";

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
    const router = useRouter();
    const searchHash = createHmac('sha256', JSON.stringify(props)).digest('hex');

    const {search_query, maxPostHeight} = props;
    const [pageNumber, setPageNumber] = useState(1);

    const amountPerPage = 25;
    const searchBody = {query : search_query, amount : amountPerPage, highlight : true, page_number : pageNumber};
    const {data : searchResult, error : searchError} = useSwr({searchBody, searchHash, pageNumber}, fetchSearch);
    const isLoading = !searchResult && searchError !== null;


    const matched_docs = (searchResult && searchResult.total_matched_docs && searchResult.total_matched_docs > 0) ? Math.min(searchResult.total_matched_docs) : -1;

    return (
        <Box sx={{width : "100%"}}>
            <Typography variant="h4">Post - Search Results</Typography>
            {searchResult ? <Typography variant="subtitle" sx={{mb : 3}}>Showing {searchResult.posts.length} {matched_docs > 0 ? ` of ${matched_docs} ` : null} posts in {searchResult.time}s</Typography> : null}
            
            {matched_docs > 0 ? <Box sx={{display : "flex", justifyContent : "center", p : 5}}>
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
                style={{maxHeight : maxPostHeight, overflox : "auto"}}
            />
        
            {matched_docs > 0 ? <Box sx={{display : "flex", justifyContent : "center", p : 5}}>
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
        </Box>
    )
}