import { useRouter } from "next/router";
import {useSession} from "next-auth/react";
import useSWR from "swr";

import { Container, Divider } from "@mui/material";
import BigPostContainer from "../../components/BigPostContainer/BigPostContainer";

const getPosts = async ({mode, session, loading}) => {
    if (loading) return null;

    let result;
    if(session){
        switch(mode){
            case "all":
                result = await fetch(`https://api.hive-discover.tech/v1/accounts/feed?username=${session.user.name}&amount=50`)
                                        .then(response => response.json())
                return {posts : result.posts, title: "All Recommendations for you"};
            case "communities":
                result = await fetch(`https://api.hive-discover.tech/v1/accounts/community-feed?username=${session.user.name}&amount=50`)
                                        .then(response => response.json())
                return {posts : result.posts, title: "Community based Recommendations for you"};
            case "tags":
                result = await fetch(`https://api.hive-discover.tech/v1/accounts/tag-feed?username=${session.user.name}&amount=50`)
                                        .then(response => response.json())
                return {posts : result.posts, title: "Tag based Recommendations for you"};    
        }
    }


    // Get trending posts
    return {posts : [], title: "Trending Posts - Coming soon"};   
}

export default function CommunityIndex(props){
    const router = useRouter();
    const {mode} = router.query;

    const {data : session, loading} = useSession();

    const {data : results, error} = useSWR({mode, session, loading}, getPosts);
    const {posts, title} = results ? results : {};
    const postsLoading = !results && !error;

    return (
        <Container>
            <h1>{title}</h1>
            <Divider />
            <BigPostContainer posts={posts} loading={postsLoading} />
        </Container>
    )
}