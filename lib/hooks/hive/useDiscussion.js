import useSWRImmutable from 'swr/immutable'

const fetcher = async (rpc_data) => {
    // Load Libraries
    const hive = await import("@hiveio/hive-js")
    const preparePost = await import("../../preparePost").then(m => m.default);
    
    let results = await hive.api.callAsync('bridge.get_discussion', {author : rpc_data.author, permlink : rpc_data.permlink, observer : rpc_data.observer})
        .catch((err)=>{throw new Error("Network error")});

    if(results.error)
        throw new Error("Unknown error");

    results = Object.entries(results).filter(([authorperm, post]) => authorperm !== `${rpc_data.author}/${rpc_data.permlink}`); // filter out the post itself
    results = results.map(([authorperm, post]) => preparePost(post)); // prepare the post and remove the authorperm key
    results = results.map(post => {return {...post, created : new Date(post.created)}}); // Parse created

    // Sort by mode
    switch(rpc_data?.sort){
        case "reward":
            results = results.sort((a, b) => 
                (b.paidout ? b.payout_value : parseInt(b.pending_payout_value.substring(0, b.pending_payout_value.indexOf(" ")))) - (a.paidout ? a.payout_value : parseInt(a.pending_payout_value.substring(0, a.pending_payout_value.indexOf(" "))))
            );
            break;
        case "votes":
            results = results.sort((a, b) => b.up_votes - a.up_votes);
            break;
        case "reputation":
            results = results.sort((a, b) => b.author_reputation - a.author_reputation);
            break;
        case "oldest":
            results = results.sort((a, b) => a.created - b.created);
            break;
        default: // == newest
            results = results.sort((a, b) => b.created - a.created);
            break;
    }
    
    return results;
}

export default function useDiscussion(rpc_data) {
    if(!rpc_data?.author || !rpc_data?.permlink)
        return {...useSWRImmutable(null), pending : true};

    const {data, error} = useSWRImmutable(rpc_data, fetcher);
    return {data, error, pending : !data && !error};
}