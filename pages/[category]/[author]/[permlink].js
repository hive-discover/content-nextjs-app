import {useRouter} from 'next/router';
import useSWR from 'swr';
import useSWRImmutable from 'swr/immutable'
import dynamic from 'next/dynamic'
import getDate from '../../../lib/niceTimestamp';
import Link from 'next/link';
import {useEffect, useState, useRef, useMemo} from 'react';
import { useRouterScroll } from '@moxy/next-router-scroll';
import {useSession} from 'next-auth/react';

import {Box, Container, Divider, Grid, Paper, Skeleton} from '@mui/material';
import CategoryChip from '../../../components/CategoryChip/CategoryChip';
import PostStats from '../../../components/PostStats/PostStats';
import useIntersection from '../../../lib/hooks/useIntersection'
import useHivePost from '../../../lib/hooks/hive/useHivePost';
import {getDeviceKeyEncodedMessage} from '../../../lib/backendAuth';

const ProfileColumnCard = dynamic(() => import('../../../components/ProfileColumnCard/ProfileColumnCard'));
const CommunityCard = dynamic(() => import('../../../components/CommunityCard/CommunityCard'));
const PostsCard = dynamic(() => import('../../../components/PostsCard/PostsCard'));
const Comments = dynamic(() => import('../../../components/Comments/Comments'));


const getTextLoader = () => {
    const elem = [
        <Skeleton key={1} variant="text" width="100%" height={20} />,
        <Skeleton key={2} variant="text" width="100%" height={20} />,
        <Skeleton key={3} variant="text" width="80%" height={20} />,
        <br/>,
        <Skeleton key={4} variant="rect" width="100%" height="500px" />,
        <br/>,
        <Skeleton key={5} variant="text" width="100%" height={20} />,
        <Skeleton key={6} variant="text" width="80%" height={20} />,
    ]

    return elem;
}

const HiveDiscoverAPI_Fetcher = ({data, path}) => fetch("https://api.hive-discover.tech/v1" + path, {method : "POST", body : JSON.stringify(data), headers : {'Content-Type' : 'application/json'}})
  .then(res => res.json()) // Parse as JSON
  .then(res => {if(res.status !== "ok") throw new Error(res); return res;}); // Handle errors

  const HiveDiscoverAPI_POST_AUTH_Fetcher = (msg_encoded) => {
    return ({data, path}) => {
        return fetch(
            "https://api.hive-discover.tech/v1" + path, 
            {
                method : "POST", 
                body : JSON.stringify({...data, msg_encoded}), 
                headers : {'Content-Type' : 'application/json'}
            })
            .then(res => res.json());
    }
}

const getTags = (tags) => {
    if(!tags) return [];

    return (
        <Box sx={{display : "flex", flexWrap : "wrap", justifyContent : "space-between"}}>
        {tags.map((tag, index) => {
            return (
                <Link href={`/tag/${tag}`} key={index}>
                    <a>#{tag}</a>
                </Link>
            )})}
        </Box>)
}

const parsePostBody = async (body, setBody) => {
    if(!body) return null;

    const parse = await import('html-react-parser').then(m => m.default);
    setBody(parse(body));
}

export default function ShowPost(props){
    const router = useRouter();
    let {category, author, permlink} = router.query;
    author = (author || "").replace("@", "");

    const { updateScroll } = useRouterScroll();
    const { data: session } = useSession();
    const {data : post, pending : postLoading, error : postError, mutate : postMutate} = useHivePost({author, permlink});
    const {data : community} = useSWR(`/api/getCommunity/${category}`, (url) => fetch(url).then(r => r.json()));
    const {data : similarPostsByAuthor, error : similarPostsByAuthorError} = useSWR({data : {author, permlink, amount : 7}, path : "/search/similar-by-author"}, HiveDiscoverAPI_Fetcher);
    const {data : similarPostsByCommunity, error : similarPostsByCommunityError} = useSWR({data : {author, permlink, amount : 7, parent_permlinks : [category], minus_days : 7}, path : "/search/similar-post"}, HiveDiscoverAPI_Fetcher);
    const {data : similarPostsByTag, error : similarPostsByTagError} = useSWR({data : {author, permlink, amount : 7, tags : [post && post.json_metadata.tags.length >= 1 ?  post.json_metadata.tags[0] : "placeholder"], minus_days : 7}, path : "/search/similar-post"}, HiveDiscoverAPI_Fetcher);

    const publishedInCommunity = community && community.title && !community.error;
    const [isLoading, setLoading] = useState(true);

    // Parse Body 
    const [postBody, setPostBody] = useState(null);

    useEffect(()=>{
        if(post && post.body){
            parsePostBody(post.body, setPostBody)
            .then(()=>setLoading(false));
        }
    }, [post])

    useEffect(()=>{
        if(!isLoading)
            updateScroll();
    }, [isLoading])

    // Get Tracking Auth (message signed by user with deviceKey)
    const {data : trackingAuth} = useSWR(session, getDeviceKeyEncodedMessage, {refreshInterval : 60});

    // Tracking
    const tracking_meta = {
        metadata : {author, permlink},
        username : session?.user.name
    };

    //  1. Post Opened (only once)
    if(trackingAuth)
        useSWRImmutable({data : {...tracking_meta, activity_type : "post_opened"}, path : "/activities/add"}, HiveDiscoverAPI_POST_AUTH_Fetcher(trackingAuth));
    else
        useSWRImmutable(null);

    // 2. Post Full Read (only once)
    const postEndRef = useRef();
    const postEndInViewport = useIntersection(postEndRef, '0px');
    if(postEndInViewport && trackingAuth)
        useSWRImmutable({data : {...tracking_meta, activity_type : "post_full_read"}, path : "/activities/add"}, HiveDiscoverAPI_POST_AUTH_Fetcher(trackingAuth));
    else
        useSWRImmutable(null);

    // 3. Post Scrolled (every 3secs if user is still reading)
    const [hasScrolled, setHasScrolled] = useState(false);
    useEffect(()=>{
        const handleScroll = () => setHasScrolled(true);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    });
    if(hasScrolled && trackingAuth){
        useSWR({data : {...tracking_meta, activity_type : "post_scrolled"}, path : "/activities/add"}, HiveDiscoverAPI_POST_AUTH_Fetcher(trackingAuth), {refreshInterval : 3000});
        useEffect(()=>{setHasScrolled(false)});
    }else {
        useSWR(null);
        useEffect(()=>{/*nothing */});
    }


    const clickThroughMetadata = {
        origin_author : author,
        origin_permlink : permlink
    }

    // Memo All Parts of this site TODO: add comments here as well

    const postStats = useMemo(()=>{ return <PostStats post={post} mutatePost={postMutate} /> }, [post]);
    const postBodyContent = useMemo(()=>{
        return <>
            <p>{getDate(post ? post.created : null, "Published ")}</p>
            <CommunityCard name={post?.category || null}/>                     
            <br/>
            {postBody ? postBody : getTextLoader() }
            <br/>
            <Divider variant="middle" orientation='horizontal' sx={{mt : "auto"}} />
            {getTags(post?.json_metadata.tags || null)}
        </>
     }, [post, postBody]);

    const authorInfo = useMemo(()=>{
        return <>
            <ProfileColumnCard username={author} clickable={true}/>          
            <br/>
            <PostsCard 
                title={`Similar Content by @${author}`} 
                posts={similarPostsByAuthor?.posts || null} 
                clickThroughMetadata={{origin_type : "post_view_similar_by_author", ...clickThroughMetadata}}
            />
        </>;
    }, [author, similarPostsByAuthor])

    const similarInCategory = useMemo(()=>{
        if(!publishedInCommunity)
            return null;

        return <>
                <br/>
                <PostsCard title={`More from ${community.title}`} posts={similarPostsByCommunity?.posts || null} clickThroughMetadata={{origin_type : "post_view_similar_in_community", ...clickThroughMetadata}}/>
            </>;
    }, [publishedInCommunity, similarPostsByCommunity]);

    const similarByTag = useMemo(()=>{
        if(!post || !post?.json_metadata?.tags?.length)
            return null;

        return <>
            <br/>
            <PostsCard title={`Also tagged with #${post.json_metadata.tags[0]}`} posts={similarPostsByTag?.posts || null} clickThroughMetadata={{origin_type : "post_view_similar_by_tags", ...clickThroughMetadata}}/>
        </>;
    }, [post, similarPostsByTag]);

    return (
        <Container>
            {post ? 
                <h1>
                    {post.title}
                    &nbsp;&nbsp;
                    <CategoryChip category={post.category}/>     
                </h1>    
            : <Skeleton key={1} variant="text" width="100%" height={40} />}
            
            <Divider variant="middle" orientation='horizontal' />
            {postStats}

            <Grid container spacing={2} sx={{mt : 1, mb : 1}} alignItems="stretch">
                <Grid item sm={12} md={8}>
                    <Paper elevation={2} sx={{p : 5, height : "100%", overflowX : "hidden"}} id="post-body">
                        {postBodyContent}
                    </Paper>
                </Grid>
                <Grid item sm={12} md={4}>   
                    {/* More by this author */}
                    {authorInfo}
                    {/* Similar in Community  */}
                    {similarInCategory}
                    {/* Similar by Tag */}
                    {similarByTag}
                    <br/>
                </Grid>
            </Grid>

            <Divider variant="middle" orientation='horizontal' />

            {postStats}

            {/* Placeholder Tag to check, if user read the whole post */}
            <Box ref={postEndRef} />

            <br/>
            <Comments post={post} id="comments"/>
        </Container>
    );
}


