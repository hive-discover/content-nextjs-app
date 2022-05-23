import useSWR from "swr";

const fetcher = async (rpc_data) => {
    // Load Libraries
    const hive = await import("@hiveio/hive-js")
    const preparePost = await import("../../preparePost").then(m => m.default);

    // Fetch correct data
    const result = await hive.api.callAsync('bridge.get_ranked_posts', rpc_data)
        .catch(()=>{throw new Error("Network error")});

    if(!result || !Array.isArray(result))
        throw new Error("Unexpected Error");
    
    const posts = result.map(post => preparePost(post));
    return {posts};
}

export default function useAccountPosts(rpc_data) {
    return useSWR(rpc_data, fetcher);
}