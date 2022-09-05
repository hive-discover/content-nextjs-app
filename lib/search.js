
export function fetchSearch(path){
    const url = "https://api.hive-discover.tech/v1" + path;

    return async (data) => {
        const res = await fetch(url, {method : "POST", body : JSON.stringify(data), headers : {'Content-Type' : 'application/json'}}).then(res => res.json());
        
        if(res.status !== "ok"){
            const error = new Error("An error occurred while fetching the data.");
            error.response = res;
            throw error;
        }
        
        return res;
    }
}

export function onClickGo(router, queryValue, type = null){
    let params = [];
    if(queryValue.authors?.join(",").length > 0){
        params.push(`authors=${queryValue.authors.join(",")}`);
    }
    if(queryValue.tags?.join(",").length > 0){
        params.push(`tags=${queryValue.tags.join(",")}`);
    }
    if(queryValue.parent_permlinks?.join(",").length > 0){
        params.push(`parent_permlinks=${queryValue.parent_permlinks.join(",")}`);
    }

    type = type || queryValue.type;
    const link = `/search/${type ? (type + "/") : ""}${params.length > 0 ? params.join("/") + "/" : ""}${queryValue.query || ""}`

    if(router){
        router.push(link);
    } else {
        return link;
    }
}