import {useRouter} from 'next/router';
import useSWR from 'swr';
import parse from 'html-react-parser';
import dynamic from 'next/dynamic'
import getDate from '../../../lib/niceTimestamp';

import {Container, Divider, Grid, Paper, Skeleton} from '@mui/material';
import CategoryChip from '../../../components/CategoryChip/CategoryChip';
import PostStats from '../../../components/PostStats/PostStats';

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
        <Skeleton key={4} variant="rect" width="100%" height="200px" />,
        <br/>,
        <Skeleton key={5} variant="text" width="100%" height={20} />,
        <Skeleton key={6} variant="text" width="80%" height={20} />,
    ]

    return elem;
}

const HiveDiscoverAPI_Fetcher = ({data, path}) => fetch("https://api.hive-discover.tech/v1" + path, {method : "POST", body : JSON.stringify(data), headers : {'Content-Type' : 'application/json'}})
  .then(res => res.json()) // Parse as JSON
  .then(res => {if(res.status !== "ok") throw new Error(res); return res;}); // Handle errors

export default function ShowPost(props){
    const router = useRouter();
    let {category, author, permlink} = router.query;
    author = (author || "").replace("@", "");

    const {data : post, error : postError} = useSWR(`/api/getContent/${author}/${permlink}`, (url)=> fetch(url).then(res => res.json()));
    const {data : community} = useSWR(`/api/getCommunity/${category}`, (url) => fetch(url).then(r => r.json()));
    const {data : similarPostsByAuthor, error : similarPostsByAuthorError} = useSWR({data : {author, permlink, amount : 7}, path : "/search/similar-by-author"}, HiveDiscoverAPI_Fetcher);
    const {data : similarPostsByCommunity, error : similarPostsByCommunityError} = useSWR({data : {author, permlink, amount : 7, parent_permlinks : [category], minus_days : 7}, path : "/search/similar-post"}, HiveDiscoverAPI_Fetcher);
    const {data : similarPostsByTag, error : similarPostsByTagError} = useSWR({data : {author, permlink, amount : 7, tags : [post && post.json_metadata.tags.length >= 1 ?  post.json_metadata.tags[0] : "placeholder"], minus_days : 7}, path : "/search/similar-post"}, HiveDiscoverAPI_Fetcher);

    const publishedInCommunity = community && community.title && !community.error;

    return (
        <Container>
            <h1>
                {post ? post.title : null}
                &nbsp;&nbsp;
                {post ? <CategoryChip category={post.category}/> : null}      
                {!post ? <Skeleton key={1} variant="text" width="100%" height={40} /> : null}
            </h1>    
            
            <Divider variant="middle" orientation='horizontal' />
            <PostStats post={post}/>
            <Divider variant="middle" orientation='horizontal' />

            <Grid container spacing={2} sx={{mt : 1, mb : 1}} alignItems="stretch">
                <Grid item sm={12} md={8}>
                    <Paper elevation={2} sx={{p : 5, height : "100%"}} id="post-body">
                        <p>{getDate(post ? post.created : null, "Published ")}</p>
                        <CommunityCard name={post ? post.category : null}/>                     
                        <br/>
                        {post && post.body ? parse(post.body) : getTextLoader() }
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
                        ? [<br/>,<PostsCard title={`More from ${community.title}`} posts={similarPostsByCommunity ? similarPostsByCommunity.posts : null} />]
                        : null
                    }
                    {/* Similar by Tag */}
                    {
                        post && post.json_metadata.tags.length >= 1
                        ? [<br/>,<PostsCard title={`Also tagged with #${post.json_metadata.tags[0]}`} posts={similarPostsByTag ? similarPostsByTag.posts : null} />]
                        : null
                    }
                    <br/>
                </Grid>
            </Grid>

            <Divider variant="middle" orientation='horizontal' />
            <PostStats post={post}/>
            <Divider variant="middle" orientation='horizontal' />

            <Paper elevation={2} sx={{mt : 1, mb : 1, p : 2}}>
                <h2 id="comments">Comments ({post ? post.children : 0})</h2>
            </Paper>
        </Container>
    );
}


