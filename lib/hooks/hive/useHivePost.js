import useSWR, { mutate } from 'swr';
import useSWRImmutable from 'swr/immutable'

const REQUIRED_POST_FIELDS = [
    "author", "permlink", "title", "body", "category", "created", "json_metadata"
]

const getPost = async ({author, permlink})=>{
    // Get Post and validate
    const hive = await import('@hiveio/hive-js');
    const result = (await hive.api.callAsync('bridge.get_post', { author, permlink })) || {}
    if(!result || result.author !== author || result.permlink !== permlink)
        throw new Error("Post not found");

    // Prepare and return post
    const preparePost = await import('../../../lib/preparePost').then(m => m.default);
    const post = preparePost(result);
    return post;
}

export default function useHivePost(post){
    const {author, permlink} = post;
    const missingFields = REQUIRED_POST_FIELDS.filter(field => !post[field]);

    // Fetch newest version of the post and use the argument post as a fallback
    const {data : postData, error : postError} = useSWRImmutable({author : author.replace("@", ""), permlink}, getPost);
    const isLoading = !postData && !postError;

    return {
        data : postData || (missingFields === 0 ? post : null), 
        pending : isLoading, 
        error : postError
    };
}

export const prefetchHivePost = ({author, permlink})=> mutate({author : author.replace("@", ""), permlink}, getPost);
export const prefetchManyHivePosts = (authorperms)=> authorperms.map(p => mutate({author : p.author.replace("@", ""), permlink : p.permlink}, getPost));
