import {useRef} from 'react';

import BigPostContainer from '../BigPostContainer/BigPostContainer';
import useAccountPosts from '../../lib/hooks/hive/useAccountPosts';
import useIntersection from '../../lib/hooks/useIntersection'

const PAGE_SIZE = 15

export default function showTab({username, sort, observer = null}){
    sort = sort || "blog";

    // Load Posts-Data
    const swrData = {username, sort, limit: PAGE_SIZE, observer}
    const {data : posts, error : postsError, size, setSize} = useAccountPosts(swrData);

    const isLoadingInitialData = !posts && !postsError;
    const isLoadingMore = isLoadingInitialData || (size > 0 && posts && typeof posts[size - 1] === "undefined");
    const isReachingEnd = posts && posts[posts.length - 1]?.length < PAGE_SIZE;

    // Create Infinite-Scroll
    const endRef = useRef();
    const postsEndInViewport = useIntersection(endRef, '+250px'); // 250px from bottom
    if(postsEndInViewport && !isReachingEnd && !isLoadingMore && !postsError){
        setSize(size + 1);
    }

    return (
        <div>

            {
                // Show Posts in different Containers
                posts 
                ? posts.map((posts, index) => posts.length ? <BigPostContainer key={index} posts={posts} fullData={true}/> : null)
                : null
            }

            {
                // Show Loading of initial data / or more
                isLoadingMore
                ? <BigPostContainer posts={[]} isLoading={true} fullData={false} /> 
                : null
            }

            <center>
                {
                    // Show when reaching end
                    isReachingEnd
                    ? <h5>{posts.length ? "No more posts to load" : "No posts to load"}</h5>
                    : null
                }

                {
                    // Show when error
                    postsError
                    ? <h5>Something went wrong</h5>
                    : null
                }

                <h5 ref={endRef}>{!isReachingEnd && !postsError ? "Loading more..." : null}</h5>
            </center>
        </div>
    )
}