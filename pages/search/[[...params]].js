import {useEffect} from 'react';
import dynamic from 'next/dynamic'
import {useRouter} from 'next/router';

import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Divider from "@mui/material/Divider";
import CircularProgress from '@mui/material/CircularProgress';

import SearchBar from "../../components/Search/SearchBar";
import { getSearchMeta } from "../../lib/search";

const PostResults = dynamic(() => import("../../components/Search/PostResults"), {ssr: false, loading: () => <center><CircularProgress sx={{m : 5}}/></center>});


export default function Search({setPreTitle = null}) {

    const router = useRouter();
    
    const {base, time_range, query} = getSearchMeta(router?.query?.params);
    
    useEffect(() => {
        router.isReady && setPreTitle("Search for " + query);
    }, [router]);

    if(!router.isReady)
        return <center><CircularProgress /> </center>

    return (
        <Container>
            <Box sx={{mb : {xs : 5, sm : 7, md : 10}, mt : {xs : 3, sm : 4, md : 10}}}>
                <SearchBar sx={{width : "100%"}}/>
            </Box>
            
            {
                query ? <><Divider variant="middle" flexItem/><PostResults /></> : null
            }
            

            {/* {
                query && (!type || type === "posts") ? <PostResults query={query} options={options} visiblePostsCount={type !== "posts" ? 3 : null}/> : null
            }

            {
                query && (!type || type === "images") ? <ImageResults query={query} options={options} visiblePostsCount={type !== "images" ? 3 : null}/> : null
            }

            {
                query && (!type || type === "stockimages") ? <StockImageResults query={query} options={options} visiblePostsCount={type !== "stockimages" ? 3 : null}/> : null
            }

            {
                query && (!type || type === "accounts") ? <AccountResults query={query} options={options} visibleAccountsCount={type !== "accounts" ? 6 : null}/> : null
            } */}

        </Container>
    );
}