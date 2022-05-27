import useSwr from 'swr';
import {useState, useEffect} from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';

import { Button, Box, Grid, Pagination, Typography } from '@mui/material';

const ProfileColumnCard = dynamic(() => import("../../components/ProfileColumnCard/ProfileColumnCard"));

const fetchSearch = async ({searchBody}) => {
    const url = "https://api.hive-discover.tech/v1/search/accounts";
    const res = await fetch(url, {method : "POST", body : JSON.stringify(searchBody), headers : {'Content-Type' : 'application/json'}}).then(res => res.json());
    
    if(res.status !== "ok"){
        const error = new Error("An error occurred while fetching the data.");
        error.response = res;
        throw error;
    }
    
    return res;
}

export default function AccountResults(props){
    const {search_query, visibleAccountsCount} = props;
    const [pageNumber, setPageNumber] = useState(1);

    const amountPerPage = 24;
    const searchBody = {...search_query, amount : visibleAccountsCount ? visibleAccountsCount : amountPerPage, highlight : true, page_number : pageNumber};
    const {data : searchResult, error : searchError} = useSwr({searchBody, pageNumber}, fetchSearch);
    const isLoading = !searchResult && searchError !== null;

    const matched_accs = (searchResult && searchResult.total_matched_accounts) ? searchResult.total_matched_accounts : -1;
    const showPagination = matched_accs > amountPerPage && !isLoading && !visibleAccountsCount 
    return (
        <Box sx={{width : "100%"}}>
            <br/>
            <Typography variant="h4">Accounts - Search Results</Typography>
            
            {
                searchResult 
                ? <Typography variant="subtitle" sx={{mb : 3}}>Showing {searchResult.accounts.length} {matched_accs > 0 ? ` of ${matched_accs} ` : null} accounts in {searchResult.time}s</Typography> 
                : null
            }
            
            {
                showPagination 
                ?   <Box sx={{display : "flex", justifyContent : "center", p : 5}}>
                        <Pagination 
                            count={Math.round(matched_accs / amountPerPage)} 
                            showFirstButton 
                            variant="outlined" 
                            shape="rounded" 
                            size="large"
                            page={pageNumber}
                            id="top-post-navigation"
                            onChange={(event, value)=>{setPageNumber(value);}}
                        />
                    </Box> 
                : null
            }
            
            {
                searchResult 
                ?   <Grid container spacing={3} alignItems="center">
                        {searchResult.accounts.map((acc, index) => (
                            <Grid item key={index} xs={12} sm={6} md={4}>
                                <ProfileColumnCard username={acc.name} profile={acc.json_metadata.profile} clickable={true}/>
                            </Grid>
                        ))}
                    </Grid>
                : null
            }
        
            {
                showPagination 
                ?   <Box sx={{display : "flex", justifyContent : "center", p : 5}}>
                        <Pagination 
                            count={Math.round(matched_accs / amountPerPage)}
                            showFirstButton 
                            variant="outlined" 
                            shape="rounded" 
                            size="large"
                            page={pageNumber}
                            id="bottom-post-navigation"
                            onChange={(event, value)=>{setPageNumber(value); document.getElementById("top-post-navigation").scrollIntoView();}}
                        />
                    </Box> 
                : null
            }

            <br/>

            {
                visibleAccountsCount > 0 && matched_accs > visibleAccountsCount && !isLoading  
                ? <center><Link href={`/search/accounts/${search_query.query}`}><Button variant="contained">View All Results</Button></Link></center> 
                : null
            }

            <br/>
        </Box>
    )
}