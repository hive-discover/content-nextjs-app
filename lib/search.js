
export const SEARCH_BASES = ["smart", "text", "images", "stockimages"]
export const TIME_RANGES = ["week"]

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

// Rules:
// 2. The Search-Options are in between the Type-Filter and the Search-Route
// 3. The Search Query is the last item in the URL 
//  ==> e.g. "/search/[query]" "/search/text/[query]" "/search/base-text/time-range-week/[query]" 

export function getSearchMeta(params){
    let base = "smart", time_range = "week", query = null;       

    for(const param_val of (params || [])){
        if(param_val.startsWith("base-")){
            base = param_val.split("-")[1];
            if(!SEARCH_BASES.includes(base))
                base = "smart";
        }
        else if(param_val.startsWith("time-range-")){
            time_range = param_val.split("-")[1];
            if(!TIME_RANGES.includes(time_range))
                time_range = "week";
        }
        else{
            query = param_val;
        }
    }

    return {base, time_range, query};
}

export function createLinkFromSearchMeta(base, time_range, query){
    if(!query || query.length === 0)
        return "";
    return `/search/${base ? ("base-" + base + "/") : ""}${time_range ? ("time-range-" + time_range + "/") : ""}${query || ""}`;
}