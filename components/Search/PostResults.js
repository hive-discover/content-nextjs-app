import useSWRImmutable from 'swr/immutable';
import {useState, useMemo} from 'react';
import Link from 'next/link';

import { Button, Box, Pagination, Typography } from '@mui/material';

import {onClickGo, fetchSearch} from '../../lib/search';

import BigPostContainer from '../../components/BigPostContainer/BigPostContainer';

export default function PostResults({query, options, visiblePostsCount, amountPerPage = 25}){

    const [pageNumber, setPageNumber] = useState(1);

    const searchBody = {query : query, ...options, amount : visiblePostsCount ? visiblePostsCount : amountPerPage, highlight : true, page_number : pageNumber, type : "posts"};
    const {data : searchResults, error : searchError} = useSWRImmutable(searchBody, fetchSearch("/search/posts"));
    const isLoading = !searchResults && !searchError;

    const matched_docs = (searchResults && searchResults?.total_matched_docs > 0) ? Math.min(searchResults.total_matched_docs) : -1;
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

    const postsContainer = useMemo(()=>{
        if(searchError)
            return <Typography variant="h5" color="error">An error occurred while fetching the data.</Typography>

        if(searchResults || isLoading)
            return <BigPostContainer posts={searchResults?.posts} isLoading={isLoading} loadingAmount={visiblePostsCount || amountPerPage} />

        return null;
    }, [searchError, searchResults, isLoading, visiblePostsCount, amountPerPage]);

    return (
        <Box sx={{width : "100%"}}>
            <br/>
            <Typography variant="h4">Post - Search Results</Typography>
            {
                searchResults 
                ? <Typography variant="subtitle" sx={{mb : 3}}>
                    Showing {searchResults.posts.length} {matched_docs > 0 ? ` of ${matched_docs} ` : null} posts in {searchResults.time}s
                  </Typography> 
                : null
            }
            
            {paginationContainer}

            {postsContainer}
        
            {paginationContainer}

            <br/>

            {
                matched_docs > (visiblePostsCount || amountPerPage) && !showPagination  
                ? <center><Link href={onClickGo(null, {query, options, type : "posts"})}><Button variant="contained">View All Results</Button></Link></center> 
                : null
            }
        </Box>
    )
}