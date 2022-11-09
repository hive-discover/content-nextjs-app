import { useEffect } from "react";
import { useRouter } from "next/router";
import {useSession} from "next-auth/react";
import useSWRImmutable from 'swr/immutable'
import { useRouterScroll } from '@moxy/next-router-scroll';

import { Container, Divider } from "@mui/material";
import BigPostContainer from "../../../components/BigPostContainer/BigPostContainer";

const getPosts = async ({tag, session, loading}) => {
    if (loading) return null;

    if (session) {
        // Get AI recommendation
        const requestOptions = {
            method: 'POST',
            headers: {"Content-Type" : "application/json"},
            body: JSON.stringify({"tags": [tag]}),
            redirect: 'follow'
        };

        const result = await fetch(`https://api.hive-discover.tech/v1/accounts/feed?username=${session.user.name}&amount=50`, requestOptions)
            .then(response => response.json())

        return {posts : result.posts, title: "Recommendations for you"};
    } else {
        // Get trending posts
        return {posts : [], title: "Trending Posts - Coming soon"};
    }

    return {};
}

export default function CommunityIndex(props){
    const router = useRouter();
    const {tag, params} = router.query;

    const {data : session, loading} = useSession();

    const {data : results, error} = useSWRImmutable({tag, session, loading}, getPosts);
    const {posts, title} = results ? results : {};
    const postsLoading = !results && !error;

    // Adjust scrollment
    const { updateScroll } = useRouterScroll();
    useEffect(()=>{
        if(posts && !postsLoading)
            updateScroll();
    }, [posts, postsLoading])

    return (
        <Container>
            <h1>{title}</h1>
            <Divider />
            <BigPostContainer posts={posts} loading={postsLoading} />
        </Container>
    )
}