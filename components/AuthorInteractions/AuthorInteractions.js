import {useState, useEffect} from 'react';
import Link from 'next/link';
import useSWR from 'swr';

import { useDispatch, useSelector } from 'react-redux';
import { addPosts, setLoadMore, initTabObject } from '../../redux/slices/AuthorActivitiesSlice';

import {Box, Tab, Tabs} from '@mui/material'
import LoadingButton from '@mui/lab/LoadingButton';

import BigPostContainer from '../../components/BigPostContainer/BigPostContainer';


const tabs = ["blog", "posts", "activities"];
const tabLabels = ["Blog", "All Posts", "Activities"];

const getAccountPostLink = (username, selectedTab, tabStorage)=>{
    let lastAuthor, lastPermlink;  
    
    if(tabStorage.loadMore && tabStorage.last){
        lastAuthor = tabStorage.last.author;
        lastPermlink = tabStorage.last.permlink;
    }

    return `/api/getAccountPosts/${username}?a=b${selectedTab ? `&sort=${selectedTab}` : ""}${lastAuthor ? `&start_author=${lastAuthor}` : ""}${lastPermlink ? `&start_permlink=${lastPermlink}` : ""}`;
}

const mapSelectedTabNameToIndex = (selectedTabName) => {
    const index = tabs.indexOf(selectedTabName);
    return index === -1 ? 0 : index;
}

export default function AuthorInteractions({username, selectedTab}){
    selectedTab = selectedTab || "blog";

    const dispatch = useDispatch();
    const AuthorActivitiesData = useSelector(state => state.AuthorActivities);
    const tabStorage = AuthorActivitiesData[username] && AuthorActivitiesData[username][selectedTab] ? AuthorActivitiesData[username][selectedTab] : initTabObject();

    // Get posts from HIVE
    let {data: loadedPosts, error: loadedPostsError} = useSWR(getAccountPostLink(username, selectedTab, tabStorage), (url)=> fetch(url).then(res => res.json()));

    useEffect(() => {
        // Add loaded posts to postStorage
        if(username && loadedPosts && Array.isArray(loadedPosts)){
            dispatch(addPosts([username, selectedTab, loadedPosts]));       
        }
    }, [username, loadedPosts, selectedTab]);

    useEffect(() => {
        if(tabStorage.firstLoad)
            window.scrollTo(0, 0);
    });

    return (
        <Box>
            {/* Tab-Bar */}
            <Box sx={{ width: '100%', bgcolor: 'background.paper' }}>
                <Tabs value={mapSelectedTabNameToIndex(selectedTab)} centered>
                    {tabs.map((_, index) => {
                        return (
                            <Link href={`/u/${username}/${tabs[index]}`} scroll={false} passHref>
                                <Tab label={tabLabels[index]} ariaControls={index} />
                            </Link>
                        )}
                    )}
                </Tabs>    
            </Box>   

            {/* Tab-Content */}
            <Box sx={{ width: '100%', bgcolor: 'background.paper' }}>
                 <BigPostContainer posts={tabStorage.posts} fullData={true} isLoading={tabStorage.firstLoad}/>
            </Box>

            {/* Load More */}
            <Box sx={{ width: '100%', bgcolor: 'background.paper', display : "flex", justifyContent : "center", p : 3 }}>
                <LoadingButton 
                    variant="contained" 
                    color="primary" 
                    size="large"
                    loading={tabStorage.loadMore || tabStorage.firstLoad}
                    onClick={() => {dispatch(setLoadMore([username, selectedTab]));}}
                >
                    Load more
                </LoadingButton>
            </Box>
        </Box>
    );
}