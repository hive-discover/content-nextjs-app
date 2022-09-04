import useSWRImmutable from 'swr/immutable'
import useSWR from 'swr';

import useDiscussions from "../lib/hooks/hive/useDiscussions";

const HiveDiscoverAPI_POST_AUTH_Fetcher = (msg_encoded) => {
  return ({data, path}) => {
      return fetch(
          "https://api.hive-discover.tech/v1" + path, 
          {
              method : "POST", 
              body : JSON.stringify({...data, msg_encoded}), 
              headers : {'Content-Type' : 'application/json'}
          })
          .then(res => res.json());
  }
}

export function chooseMode(mode, session, isLoading, msg_encoded){

    if(isLoading){
        return {
            title : "Loading...",
            dataHook : () => useSWRImmutable(null),
            allowed : true
        }
    }

    const private_memo_key = session?.user.privateMemoKey;
    const username = session?.user.name;

    switch(mode){
        case "all":
            return {
                title : "Recommendations in General",
                dataHook : () => useSWRImmutable({data : {private_memo_key, amount : 25, username}, path : "/feed"}, HiveDiscoverAPI_POST_AUTH_Fetcher(msg_encoded)),
                allowed : session?.user.name,
                logInViewpoint : true,
            };
        case "communities":
            return {
                title : "Recommendations based on your subsribed Communities",
                dataHook : () => useSWRImmutable({data : {private_memo_key, amount : 25, username, community_based : true}, path : "/feed"}, HiveDiscoverAPI_POST_AUTH_Fetcher(msg_encoded)),
                allowed : session?.user.name,
                logInViewpoint : true,
            };
        case "tags":
            return {
                title : "Recommendations based on used Tags",
                dataHook : () => useSWRImmutable({data : {private_memo_key, amount : 25, username : session?.user.name, tag_based : true}, path : "/feed"}, HiveDiscoverAPI_POST_AUTH_Fetcher(msg_encoded)),
                allowed : session?.user.name,
                logInViewpoint : true,
            };
        case "trending":
            return {
                title : "Trending Posts",
                dataHook : () => useDiscussions({limit : 25, sort : "trending", observer : session?.user.name}),
                allowed : true
            };
        case "hot":
            return {
                title : "Hot Posts",
                dataHook : () => useDiscussions({limit : 25, sort : "hot", observer : session?.user.name}),
                allowed : true
            };
        case "new":
            return {
                title : "New Posts",
                dataHook : () => useDiscussions({limit : 25, sort : "created", observer : session?.user.name}),
                allowed : true
            }       
    }
}