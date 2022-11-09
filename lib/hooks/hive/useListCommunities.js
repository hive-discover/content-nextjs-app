import useSWR from "swr";

const fetcher = async ({limit, sort = "rank", query = null, observer = null}) => {
    const hive = await import("@hiveio/hive-js")
    
    // Fetch correct data
    const result = await hive.api.callAsync('bridge.list_communities', {limit, sort, query, observer})
        .catch(()=>{throw new Error("Network error")});

    if(!result || !Array.isArray(result))
        throw new Error("Invalid response");
    
    return result;
}

export default function useListCommunities(rpc_data) {
    return useSWR(rpc_data, fetcher);
}