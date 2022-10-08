import { useState, useMemo } from 'react';
import useSWRImmutable from 'swr/immutable'
import Link from 'next/link'

import { Button, Box, Pagination, Typography } from '@mui/material';

import PhotoPostsContainer from "../PhotoPostsContainer/PhotoPostsContainer";

import {onClickGo, fetchSearch} from '../../lib/search';


export default function StockImageResults({query, options, visiblePostsCount, amountPerPage = 25}){
    const [pageNumber, setPageNumber] = useState(1);

    const searchBody = {text : query, ...options, amount : visiblePostsCount ? visiblePostsCount : amountPerPage, page_number : pageNumber, type : "images"};
    const {data : searchResults, error : searchError} = useSWRImmutable(searchBody, fetchSearch("/images/text-to-image"));
    const isLoading = !searchResults && !searchError;

    const matched_docs = (searchResults && searchResults?.total > 0) ? searchResults.total : -1;
    const showPagination = matched_docs > amountPerPage && !isLoading && !visiblePostsCount;

    const paginationContainer = useMemo(()=>{
        if(!showPagination)
            return null;

        return <Box sx={{display : "flex", justifyContent : "center", p : 5}}>
                   <Pagination 
                        count={Math.ceil(matched_docs / amountPerPage)} 
                        showFirstButton 
                        variant="outlined" 
                        shape="rounded" 
                        size="large"
                        page={pageNumber}
                        id="top-post-navigation"
                        onChange={(event, value)=>{setPageNumber(value);}}
                    />
                </Box>;
    }, [showPagination, matched_docs, amountPerPage, pageNumber]);

    const photoPostsContainer = useMemo(()=>{
        if(searchError)
            return <Typography variant="h5" color="error">An error occurred while fetching the data.</Typography>

        if(searchResults || isLoading)
            return <PhotoPostsContainer posts={searchResults?.posts} isLoading={isLoading} loadingAmount={visiblePostsCount || amountPerPage}/>

        return null;
    }, [searchResults, searchError, isLoading, visiblePostsCount, amountPerPage]);

    return (
        <Box>
            <br/>
            <Typography variant="h4">Images - Search Results</Typography>
            {
                searchResults?.posts 
                ? <Typography variant="subtitle" sx={{mb : 3}}>
                    Showing {searchResults.posts.length} {matched_docs > 0 ? ` of ${matched_docs} ` : null} images in {searchResults.time}s
                  </Typography> 
                : null
            }

            {paginationContainer}
            
            {photoPostsContainer}
            
            {paginationContainer}

            <br/>

            {
                matched_docs > (visiblePostsCount || amountPerPage) && !showPagination  
                ? <center><Link href={onClickGo(null, {query, options, type : "images"})}><Button variant="contained">View All Results</Button></Link></center> 
                : null
            }
            
            <br/>
        </Box>
    )
}