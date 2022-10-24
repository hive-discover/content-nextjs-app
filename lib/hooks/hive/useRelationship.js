import useSWR from "swr";

const fetcher = async ({rpc_data}) => {
    const hive = await import("@hiveio/hive-js")

    // Fetch correct data
    const result = await hive.api.callAsync('bridge.get_relationship_between_accounts', rpc_data)
        .catch(()=>{throw new Error("Network error")});

    if (err || result?.follows === null)
        throw new Error("Accounts not found");
    
    return result;
}

export default function useRelationship(rpc_data) {
    // rpc_data = [userA, userB]
    return useSWR({rpc_data}, fetcher);
}