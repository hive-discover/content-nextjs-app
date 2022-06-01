import {useRouter} from 'next/router';
import useSWR from 'swr';
import useSWRImmutable from 'swr/immutable'
import dynamic from 'next/dynamic'
import getDate from '../../../lib/niceTimestamp';
import Link from 'next/link';
import {useEffect, useState, useRef} from 'react';
import { useRouterScroll } from '@moxy/next-router-scroll';
import {useSession} from 'next-auth/react';

import {Box, Container, Divider, Grid, Paper, Skeleton} from '@mui/material';
import CategoryChip from '../../../components/CategoryChip/CategoryChip';
import PostStats from '../../../components/PostStats/PostStats';
import useIntersection from '../../../lib/hooks/useIntersection'
import useHivePost from '../../../lib/hooks/hive/useHivePost';

const ProfileColumnCard = dynamic(() => import('../../../components/ProfileColumnCard/ProfileColumnCard'));
const CommunityCard = dynamic(() => import('../../../components/CommunityCard/CommunityCard'));
const PostsCard = dynamic(() => import('../../../components/PostsCard/PostsCard'));
// TODO: Comments dynamic loading

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

const initTrackingAuth = async(session, setTrackingAuth)=>{
    if(!session) return;

    if(session.provider === "hivesigner"){
        setTrackingAuth({access_token : session.accessToken});
    }

    if(session.provider === "keychain"){
        const keychain = await import('@hiveio/keychain').then(m=>m.keychain);
        const {success, msg} = await keychain(
            window,
            'requestEncodeMessage',
            session.user.name, 
            'action-chain',
            '#' + session.user.name,
            'Posting'
        );

        if(success)
            setTrackingAuth({ keychain_signed_msg: msg })
    }

}



export default function ShowPost(props){
    const router = useRouter();
    let {category, author, permlink} = router.query;
    author = (author || "").replace("@", "");

    const { updateScroll } = useRouterScroll();
    const { data: session } = useSession()
    const {data : post, pending : postLoading, error : postError} = useHivePost({author, permlink});
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

    // Prepare Tracking Auth
    const [trackingAuth, setTrackingAuth] = useState(null);
    useEffect(()=>{
        if(session && !trackingAuth)
            initTrackingAuth(session, setTrackingAuth);
    }, [session, trackingAuth])

    const tracking_meta = {
        metadata : {author, permlink},
        username : session?.user.name,
        ...trackingAuth
    };

    // Tracking Account's events
    // * 1. PostOpened
    const {} = useSWRImmutable(
        trackingAuth ? `post-opened: '@${author}/${permlink}'` : null, 
        () => fetch(
            "https://api.hive-discover.tech/v1/activities/add", 
            { method : "POST", body : JSON.stringify({...tracking_meta, activity_type : "post_opened"}), headers : {'Content-Type' : 'application/json'}}
        )
    );
    // * 2. PostScroll (just fire it every 3 seconds when the page is in focus - SWR will take care of the rest)
    const {} = useSWR(
        trackingAuth ? `post-scroll: '@${author}/${permlink}'` : null,
        () => fetch(
            "https://api.hive-discover.tech/v1/activities/add",
            { method : "POST", body : JSON.stringify({...tracking_meta, activity_type : "post_scrolled"}), headers : {'Content-Type' : 'application/json'}}
        ),
        {
            refreshInterval : 3000,
        }
    );
    // * 3. PostFullRead
    const postEndRef = useRef();
    const postEndInViewport = useIntersection(postEndRef, '0px');
    const {} = useSWRImmutable(
        postEndInViewport && !isLoading ? `post-full-read: '@${author}/${permlink}'` : null,
        () => fetch(
            "https://api.hive-discover.tech/v1/activities/add",
            { method : "POST", body : JSON.stringify({...tracking_meta, activity_type : "post_full_read"}), headers : {'Content-Type' : 'application/json'}}
        )
    );

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
            <PostStats post={post}/>

            <Grid container spacing={2} sx={{mt : 1, mb : 1}} alignItems="stretch">
                <Grid item sm={12} md={8}>
                    <Paper elevation={2} sx={{p : 5, height : "100%", overflowX : "hidden"}} id="post-body">
                        <p>{getDate(post ? post.created : null, "Published ")}</p>
                        <CommunityCard name={post ? post.category : null}/>                     
                        <br/>
                        {postBody ? postBody : getTextLoader() }
                        <br/>
                        <Divider variant="middle" orientation='horizontal' sx={{mt : "auto"}} />
                        {getTags(post ? post.json_metadata.tags : null)}
                    </Paper>
                </Grid>
                <Grid item sm={12} md={4}>   
                    {/* More by this author */}
                    <ProfileColumnCard username={author} clickable={true}/>          
                    <br/>
                    {/* Similar in Community  */}
                    <PostsCard title={`Similar Content by @${author}`} posts={similarPostsByAuthor ? similarPostsByAuthor.posts : null} />
                    {
                        publishedInCommunity 
                        ? <><br/><PostsCard title={`More from ${community.title}`} posts={similarPostsByCommunity ? similarPostsByCommunity.posts : null} /></>
                        : null
                    }
                    {/* Similar by Tag */}
                    {
                        post && post.json_metadata.tags.length >= 1
                        ? <><br/><PostsCard title={`Also tagged with #${post.json_metadata.tags[0]}`} posts={similarPostsByTag ? similarPostsByTag.posts : null} /></>
                        : null
                    }
                    <br/>
                </Grid>
            </Grid>

            <Divider variant="middle" orientation='horizontal' />
            <PostStats post={post}/>

            {/* Placeholder Tag to check, if user read the whole post */}
            <Box ref={postEndRef} />

            <Paper elevation={2} sx={{mt : 1, mb : 1, p : 2}}>
                <h2 id="comments">Comments ({post ? post.children : 0})</h2>
            </Paper>
        </Container>
    );
}


