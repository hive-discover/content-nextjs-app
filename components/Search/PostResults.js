import useSWRImmutable from 'swr/immutable';
import {useState, useMemo} from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

import { Button, Box, Pagination, Typography, CircularProgress } from '@mui/material';

import {onClickGo, fetchSearch, getSearchMeta} from '../../lib/search';

import BigPostContainer from '../../components/BigPostContainer/BigPostContainer';

const searchFetcher = async (base, time_range, query) => {
    const body = {query, amount : 100, type : base, time_range, full_data : true};

    const url = base !== "stockimages" ? "https://api.hive-discover.tech/search/posts" : "https://api.hive-discover.tech/images/text";

    const response = await fetch(url, {method : "POST", body : JSON.stringify(body), headers : {'Content-Type' : 'application/json'}});
    if(!response.ok){
        const error = new Error("An error occurred while fetching the data.");
        error.response = response;
        throw error;
    }

    const result = await response.json();
    if(result.status !== "ok"){
        const error = new Error("An error occurred while fetching the data.");
        error.response = result;
        throw error;
    }

    return result;
}

export default function PostResults(posts_per_page = 10){
    const router = useRouter();
    const {base, time_range, query} = getSearchMeta(router?.query?.params);
    
    const {data : searchResults, error : searchError} = useSWRImmutable([base, time_range, query], searchFetcher);
    const isLoading = !searchResults && !searchError;

    if(searchError)
        console.error(searchError);

    return (
        <Box sx={{width : "100%"}}>
            <br/>
            <Typography variant="h4">Search Results</Typography>   
                     
            {
                searchResults?.posts?.length > 0
                ? <BigPostContainer posts={searchResults.posts} fullData={false} />
                : null
            }

            {
                searchError ? <Typography variant="h5" color="error">An error occurred while fetching the data.</Typography> : null
            }

            {
                isLoading ? <center><CircularProgress sx={{m : 5}}/></center> : null
            }
        </Box>
    )
}