import { configureStore } from '@reduxjs/toolkit'

import AuthorActivitiesReducer from './slices/AuthorActivitiesSlice';
import postsSlice from './slices/postsSlice';

export const store = configureStore({
    reducer: {
        AuthorActivities : AuthorActivitiesReducer,
        hivePosts : postsSlice
    }
});

