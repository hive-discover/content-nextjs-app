import useSWRImmutable from 'swr/immutable'

const REQUIRED_ACC_FIELDS = [
    "name", "posting_json_metadata", "voting_manabar", "downvote_manabar"
]

const getAccount = async (username)=>{
    // Get Post and validate
    const hive = await import('@hiveio/hive-js');
    const {result, err} = await new Promise((resolve)=>{
        hive.api.getAccounts([username], (err, result) => resolve({err, result}));
    }).catch(err => {return {err : (err || "Unknown Error")}});

    if (!result || err) 
        throw Error(err); // Network error

    if (result?.length !== 1 || result[0]?.name !== username) 
        throw Error("Account not found"); // Account not Found

    // We found the Account ==> parse metadata and return
    const account = result[0];
    try{
        account.posting_json_metadata = JSON.parse(account.posting_json_metadata);
    } catch{
        account.posting_json_metadata = {};
    }
    return account;
}

export default function useAccount(account){
    const {name, username} = account;
    const missingFields = REQUIRED_ACC_FIELDS.filter(field => !account[field]);

    // Fetch newest version of the account
    const {data : accData, error : accError} = useSWRImmutable((name || username)?.replace("@", ""), getAccount);

    // Return newest version when ready OR account input when all fields are present
    return {
        data : accData || (missingFields === 0 ? account : null), 
        pending : !accData && !accError, 
        error : accError
    };
}