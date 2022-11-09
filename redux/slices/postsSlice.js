
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

const initialPostState = {
    pending : true,
    error : null,
    requestId : null,
    // body, title, metadata, tags, author, permlink, parent_permlink, parent_author, json_metadata
};

const initialState = {
    // [authorperm] : initialRequestState
}

export function getAuthorperm(p){
    return `${p.author}/${p.permlink}`;
}

export const fetchPosts = createAsyncThunk("postsSlice/fetchPosts", async(posts, { getState, requestId, rejectWithValue }) => {
    // Filter out posts that are didn't match the requestId
    const currentState = getState().hivePosts;
    posts = posts.filter(p => currentState[getAuthorperm(p)].requestId == requestId);
    if(posts.length === 0)
        return []; // No posts to fetch

    // This request has to fetch the data
    //  * Build rpc-call
    const request_body = posts.map((p, index) => {
        return {
            "jsonrpc": "2.0",
            "method": "bridge.get_post",
            "params": p,
            "id": index
        }
    });
    const options = {
        method: "POST",
        headers : {'Content-Type': 'application/json'},
        body: JSON.stringify(request_body)
    }

    //  * Fetch data
    const response = await fetch(process.env.HIVE_NODE_URL, options).catch(e => rejectWithValue("Network Error"));
    if(response && response.status === 200){
        // The API returns an array of results
        return await response.json();
    }

    // * An error occured
    rejectWithValue("Unexpected Error");
});

export const postsSelector = (state, posts) => posts.map(p => state[`${p.author}/${p.permlink}`]);
export const postSelector = (state, post) => state[`${post.author}/${post.permlink}`];

export const postsSlice = createSlice({
    name: "hivePosts",
    initialState,
    reducers: {
        addPosts: (state, action) => {
            // Add all new Posts to the state and update mostly
            const {posts, update = true} = action.payload;
            posts.forEach(p => {
                const authorperm = getAuthorperm(p);
                if(update || !state[authorperm])
                    state[authorperm] = p;
            });
        }
    },
    extraReducers: {
        [fetchPosts.pending] (state, action) {
            const posts = action.meta.arg;
            const requestId = action.meta.requestId;
            
            // add this requestId to all posts which are not yet fetched successfully
            posts.forEach(p => {
                const authorperm = getAuthorperm(p.author, p.permlink);
                if(!state[authorperm])
                    state[authorperm] = {...initialPostState, requestId};
            });
        },
        [fetchPosts.fulfilled] (state, action) {
            // Set the data, remove the pending status
            const {id} = action.meta.arg;
            state[id].data = action.payload;
            state[id].pending = false;
            state[id].error = null;
        },
        [fetchPosts.rejected] (state, action) {
            // Set the error, remove the pending status
            const {id} = action.meta.arg;
            state[id].error = action.payload;
            state[id].pending = false;
            state[id].data = null;
        }
    }
});

export default postsSlice.reducer;
export const { addPosts } = postsSlice.actions;
