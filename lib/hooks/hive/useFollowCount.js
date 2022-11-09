import useSWRImmutable from 'swr/immutable'

const getFollowCount = async ({username})=>{
    // Get Post and validate
    const hive = await import('@hiveio/hive-js');
    const {result, err} = await new Promise((resolve)=>{
            hive.api.getFollowCount(username, (err, result) => resolve({err, result}));    
    }).catch(err => {return {err : (err || "Unknown Error")}});

    if(!result || err)
        throw Error(err || "Network Error"); 
    if (result.account !== username) 
        throw Error("Account not found"); // Account not Found

    return result;
}

export default function useFollowCount(account){
    const {name, username} = account;

    // Fetch newest version of the account
    const {data : accData, error : accError, ...other} = useSWRImmutable({username : (username || name)?.replace("@", ""), "source" : "useFollow"}, getFollowCount);

    // Return newest version when ready OR account input when all fields are present
    return {
        ...other,
        data : accData, 
        pending : !accData && !accError, 
        error : accError
    };
}