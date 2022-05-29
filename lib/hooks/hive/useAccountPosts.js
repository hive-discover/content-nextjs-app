import useSWRInfinite from "swr/infinite";

const fetcher = async (rpc_data) => {
    // Load Libraries
    const hive = await import("@hiveio/hive-js")
    const preparePost = await import("../../preparePost").then(m => m.default);

    // Fetch data
    const result = await hive.api.callAsync('bridge.get_account_posts', rpc_data).catch(()=>{throw new Error("Network error")});
    if(!result || !Array.isArray(result))
        throw Error("Account not found")
    
    const posts = result.map(post => preparePost(post));
    return posts;
}

export default function useAccountPosts(query) {
    const {username, sort, observer, limit} = query;

    const getKey = (pageIndex, previousPageData) => {
        if(pageIndex > 0 && previousPageData.length === 0)
            return null; // Nothing more to load
            
        const lastAuthor = previousPageData && previousPageData.length > 0 ? previousPageData[previousPageData.length - 1].author : null;
        const lastPermlink = previousPageData && previousPageData.length > 0 ? previousPageData[previousPageData.length - 1].permlink : null;

        return {
            "sort": sort || "blog", // blog, feed, posts, replies, payout
            "account":username.replace("@", ""),
            "limit":limit || 15,
            "start_author":lastAuthor,
            "start_permlink":lastPermlink,
            "observer": observer ? observer.replace("@", "") : null
        };
    }

    return useSWRInfinite(getKey, fetcher, {persistSize : true});
}