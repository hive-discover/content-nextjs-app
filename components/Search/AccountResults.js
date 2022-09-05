import useSWRImmutable from 'swr/immutable';
import {useState, useMemo} from 'react';
import Link from 'next/link';

import { Button, Box, Grid, Pagination, Typography, CircularProgress } from '@mui/material';
import ProfileColumnCard from "../../components/ProfileColumnCard/ProfileColumnCard"

import {onClickGo, fetchSearch} from '../../lib/search';


export default function AccountResults({query, options, visibleAccountsCount, amountPerPage = 30}){
    const [pageNumber, setPageNumber] = useState(1);

    const searchBody = {query : query, ...options, amount : visibleAccountsCount || amountPerPage, highlight : true, page_number : pageNumber, type : "accounts"};
    const {data : searchResults, error : searchError} = useSWRImmutable(searchBody, fetchSearch("/search/accounts"));
    const isLoading = !searchResults && !searchError;

    const matched_accs = (searchResults && searchResults?.total_matched_accounts > 0) ? searchResults.total_matched_accounts : -1;
    const showPagination = matched_accs > amountPerPage && !isLoading && !visibleAccountsCount 

    const paginationContainer = useMemo(()=>{
        if(!showPagination)
            return null;

        return <Box sx={{display : "flex", justifyContent : "center", p : 5}}>
                    <Pagination 
                        count={Math.ceil(matched_accs / amountPerPage)} 
                        showFirstButton 
                        variant="outlined" 
                        shape="rounded" 
                        size="large"
                        page={pageNumber}
                        id="top-post-navigation"
                        onChange={(event, value)=>{setPageNumber(value);}}
                    />
                </Box> 
    }, [showPagination, matched_accs, amountPerPage, pageNumber]);

    const accountsContainer = useMemo(()=>{
        if(searchError)
            return <Typography variant="h5" color="error">An error occurred while fetching the data.</Typography>

        if(searchResults?.accounts){
            return <Grid container spacing={3} alignItems="center">
                {searchResults.accounts.map((acc, index) => (
                    <Grid item key={index} xs={12} sm={6} md={4}>
                        <ProfileColumnCard username={acc.name} profile={acc.json_metadata.profile} clickable={true}/>
                    </Grid>
                ))}
            </Grid>
        }

        if(isLoading)
            return <center><CircularProgress /> <Typography variant="h5">Loading...</Typography></center>

        return null;
    }, [searchError, searchResults, visibleAccountsCount, amountPerPage]);

    return (
        <Box sx={{width : "100%"}}>
            <br/>
            <Typography variant="h4">Accounts - Search Results</Typography>
            
            {
                searchResults?.accounts 
                ? <Typography variant="subtitle" sx={{mb : 3}}>
                    Showing {searchResults.accounts.length} {matched_accs > 0 ? ` of ${matched_accs} ` : null} accounts in {searchResults.time}s
                    </Typography> 
                : null
            }
            
            {paginationContainer}
            
            {accountsContainer}
        
            {paginationContainer}

            <br/>

            {
                matched_accs > (visibleAccountsCount || amountPerPage) && !showPagination  
                ? <center><Link href={onClickGo(null, {query, options, type : "accounts"})}><Button variant="contained">View All Results</Button></Link></center> 
                : null
            }

            <br/>
        </Box>
    )
}