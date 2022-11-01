import useSWRImmutable from 'swr/immutable'

import useRankedPosts from "../lib/hooks/hive/useRankedPosts";
import {getDeviceKeyEncodedMessage} from '../lib/backendAuth';

const HiveDiscoverAPI_POST_AUTH_Fetcher = (msg_encoded) => {
  return ({data, path}) => {
      return fetch(
          "https://api.hive-discover.tech/v1" + path, 
          {
              method : "POST", 
              body : JSON.stringify({...data, msg_encoded}), 
              headers : {'Content-Type' : 'application/json'}
          })
          .then(async (res) => {
            if(res.status !== 200)
                throw new Error(res.status);

            return await res.json();
        })
  }
}

const HiveDiscoverAPI_POST_Fetcher = ({data, path}) => fetch("https://api.hive-discover.tech/v1" + path, {method : "POST", body : JSON.stringify(data), headers : {'Content-Type' : 'application/json'}})
  .then(res => res.json())

export function getLogOnInViewpointFunction(session){
    return (post) => new Promise(async(resolve, reject) => {
        const msg = await getDeviceKeyEncodedMessage(session);
        if(msg) resolve(msg);

        reject("No message");
    }).then(msg_encoded => 
        HiveDiscoverAPI_POST_Fetcher({
            data : {
                metadata : {author : post.author, permlink : post.permlink},
                activity_type : "post_recommended",
                user_id : session?.user.user_id,
                username : session?.user.name,
                msg_encoded : msg_encoded
            }, 
            path : "/activities/add"
        })
    );
}

export function chooseMode(mode, session, isLoading){

    if(isLoading){
        return {
            title : "Loading...",
            dataHook : () => useSWRImmutable(null),
            allowed : true
        }
    }

    const {
        name : username, 
        privateActivityKey : private_activity_key,     
    } = session?.user || {};


    switch(mode){
        case "all":
            return {
                title : "Recommendations in General",
                dataHook : () => useSWRImmutable({data : {private_activity_key, amount : 25, username}, path : "/feed"}, HiveDiscoverAPI_POST_AUTH_Fetcher()),
                allowed : session?.user.name,
                logInViewpoint : true,
            };
        case "communities":
            return {
                title : "Recommendations based on your subsribed Communities",
                dataHook : () => useSWRImmutable({data : {private_activity_key, amount : 25, username, community_based : true}, path : "/feed"}, HiveDiscoverAPI_POST_AUTH_Fetcher()),
                allowed : session?.user.name,
                logInViewpoint : true,
            };
        case "tags":
            return {
                title : "Recommendations based on used Tags",
                dataHook : () => useSWRImmutable({data : {private_activity_key, amount : 25, username : session?.user.name, tag_based : true}, path : "/feed"}, HiveDiscoverAPI_POST_AUTH_Fetcher()),
                allowed : session?.user.name,
                logInViewpoint : true,
            };
        case "trending":
            return {
                title : "Trending Posts",
                dataHook : () => useRankedPosts({limit : 25, sort : "trending", observer : session?.user.name}),
                allowed : true
            };
        case "hot":
            return {
                title : "Hot Posts",
                dataHook : () => useRankedPosts({limit : 25, sort : "hot", observer : session?.user.name}),
                allowed : true
            };
        case "new":
            return {
                title : "New Posts",
                dataHook : () => useRankedPosts({limit : 25, sort : "created", observer : session?.user.name}),
                allowed : true
            }       
    }
}

export function chooseCommunityMode({name, title}, mode, session, isLoading){
    if(isLoading){
        return {
            title : "Loading...",
            dataHook : () => useSWRImmutable(null),
            allowed : true
        }
    }

    const {
        name : username, 
        privateActivityKey : private_activity_key,     
    } = session?.user || {};

    switch(mode){
        case "explore":
            return {
                title : "Recommendations",
                dataHook : () => useSWRImmutable({data : {private_activity_key, amount : 25, username, filter : {parent_permlinks : [name]}}, path : "/feed"}, HiveDiscoverAPI_POST_AUTH_Fetcher()),
                allowed : session?.user.name,
                logInViewpoint : true,
            };
        case "trending":
            return {
                title : "Trending Posts",
                dataHook : () => useRankedPosts({limit : 25, tag : name, sort : "trending", observer : username}),
                allowed : true
            };
        case "hot":
            return {
                title : "Hot Posts",
                dataHook : () => useRankedPosts({limit : 25, tag : name, sort : "hot", observer : username}),
                allowed : true
            };
        case "new":
            return {
                title : "New Posts",
                dataHook : () => useRankedPosts({limit : 25, tag : name, sort : "created", observer : username}),
                allowed : true
            }    
        case "muted":
            return {
                title : "Muted Posts",
                dataHook : () => useRankedPosts({limit : 25, tag : name, sort : "muted", observer : username}),
                allowed : true
            }           
    }
}