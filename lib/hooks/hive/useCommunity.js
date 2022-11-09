import useSWR from "swr";

const fetcher = async ({name, observer}) => {
    const hive = await import("@hiveio/hive-js")
    
    // Fetch correct data
    const result = await hive.api.callAsync('bridge.get_community', {name, observer})
        .catch(()=>{throw new Error("Network error")});

    if (result?.name !== name)
        throw new Error("Community not found");
    
    return result;
}

export default function useCommunity(rpc_data) {
    return useSWR(rpc_data, fetcher);
}