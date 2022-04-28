import { createSlice } from "@reduxjs/toolkit";

const initialState = {};

export const initTabObject = () => {
    return {
        posts : [],
        last : null,
        firstLoad : true,
        loadMore : false
    }
}

export const AuthorActivitiesSlice = createSlice({
    name: "AuthorActivities",
    initialState,
    reducers: {
        addPosts(state, action) {
            let [username, tabName, posts] = action.payload;
            posts = [...posts]

            // Check if username and tab exists
            if (!state[username])
                state[username] = {};
            if (!state[username][tabName])
                state[username][tabName] = initTabObject();

            // Remove dups
            posts = posts.filter((post) => {
                const postIndex = state[username][tabName].posts.findIndex(p => p.author === post.author && p.permlink === post.permlink);
                return postIndex === -1;
            }); 

            // Mark crossposts and reblogs            
            posts.map(post => {
                if("@" + post.author !== username)
                    post.isReblog = true;
                if(post.json_metadata.tags.includes("cross-post"))
                    post.isCrosspost = true;

                return post;
            });

            // Add posts in username at tabName
            state[username][tabName].firstLoad = false;
            state[username][tabName].loadMore = false;
            state[username][tabName].posts = [...state[username][tabName].posts, ...posts];
            return state;
        },
        setLoadMore(state, action){
            const [username, tabName] = action.payload;
            const lastPost = state[username][tabName].posts[state[username][tabName].posts.length-1];

            state[username][tabName].loadMore = true;
            state[username][tabName].last = {author : lastPost.author, permlink : lastPost.permlink};
            return state;
        }
    }
});

export const { addPosts, setLoadMore } = AuthorActivitiesSlice.actions;
export default AuthorActivitiesSlice.reducer;