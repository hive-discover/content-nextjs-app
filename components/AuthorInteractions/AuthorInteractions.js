import Link from 'next/link';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';

import PostsTab from './PostsTab';

const tabs = ["blog", "posts", "comments", "activities"];
const tabLabels = ["Blog", "All Posts", "Comments", "Activities"];

const mapSelectedTabNameToIndex = (selectedTabName) => {
    const index = tabs.indexOf(selectedTabName);
    return index === -1 ? 0 : index;
}

export default function AuthorInteractions({username, selectedTab, session}){
    selectedTab = selectedTab || "blog";
    const observer = session ? session.user.username : null;

    return (
        <Box sx={{ width: '100%'}}>
            {/* Tab-Bar */}
            <Box sx={{ width: '100%', bgcolor: 'background.paper' }}>
                <Tabs value={mapSelectedTabNameToIndex(selectedTab)} centered>
                    {tabs.map((_, index) => {
                        return (
                            <Link href={`/u/${username}/${tabs[index]}`} scroll={false} passHref>
                                <Tab label={tabLabels[index]} aria-controls={index} />
                            </Link>
                        )}
                    )}
                </Tabs>    
            </Box>   

            {/* Tab-Content */}
            <Box sx={{ width: '100%', bgcolor: 'background.paper' }}>
                <PostsTab username={username} sort={tabs[mapSelectedTabNameToIndex(selectedTab)]} observer={observer}/>
            </Box>
        </Box>
    );
}