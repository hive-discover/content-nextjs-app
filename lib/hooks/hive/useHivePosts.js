
import { useDispatch, useSelector } from 'react-redux';
import { postSelector, postsSelector, addPosts } from '../../../redux/slices/postsSlice';

export default function fetching(posts, full_data = false){
    // Check state for this request
    const dispatch = useDispatch();
    const postState = useSelector(state => state.hivePosts);

    if(full_data){
        // Add all posts to the state
        dispatch(addPosts(posts));
    }

    const missingPosts = posts.filter(post => !postSelector(postState, post) && !full_data);
    

    // We have to fetch the data
    if(!fetchedData)
        dispatch(fetchData(props));

    return {
        data : fetchedData,
        pending : fetchedData ? !fetchedData.pending : true,
        error : fetchedData ? fetchedData.error : null
    }
}