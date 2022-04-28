import {configureStore} from '@reduxjs/toolkit';

import AuthorActivitiesReducer from './slices/AuthorActivitiesSlice';

export const store = configureStore({
    reducer: {
        AuthorActivities : AuthorActivitiesReducer
    }
});