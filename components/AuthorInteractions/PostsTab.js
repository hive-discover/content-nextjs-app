import {useState, useEffect } from 'react';

import BigPostContainer from '../BigPostContainer/BigPostContainer';
import useAccountPosts from '../../lib/hooks/hive/useAccountPosts';

const PAGE_SIZE = 8

function isInViewport(element, offset_y = 50) {
    const rect = element.getBoundingClientRect();
    return (
        rect.top + offset_y >= 0 &&
        rect.left >= 0 &&
        rect.bottom - offset_y <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}

export default function showTab({username, sort, observer = null, isSelected}){
    sort = sort || "blog";

    // Load Posts-Data
    const swrData = {username, sort, limit: PAGE_SIZE, observer}
    const {data : posts, error : postsError, size, setSize} = useAccountPosts(swrData);

    const [isLoadingMore, setIsLoadingMore] = useState(true);
    const isReachingEnd = posts && posts[posts.length - 1]?.length < PAGE_SIZE;

    useEffect(()=>{
        if(size === posts?.length)
            setIsLoadingMore(false);
    }, [posts, size]);

    // Create Infinite-Scroll
    const handleScroll = ()=>{
        const endHeading = document.getElementById('heading-loading-more');
        if(isSelected && isInViewport(endHeading) && !isReachingEnd && !isLoadingMore){
            setIsLoadingMore(true);  
            setSize(size + 1);              
        }
    }
    useEffect(()=>{
        document.addEventListener('scroll', handleScroll);
        return () => {
            document.removeEventListener('scroll', handleScroll);
        };
    }, [isLoadingMore, isReachingEnd, size, handleScroll, isSelected]);

    return (
        <div>

            {
                // Show Posts in different Containers
                posts 
                ? posts.map((posts, index) => posts.length ? <BigPostContainer key={index} posts={posts} fullData={true} loadingAmount={PAGE_SIZE}/>: null)
                : null
            }

            {
                // Show Loading of initial data / or more
                isLoadingMore
                ? <BigPostContainer posts={null} isLoading={true} fullData={false} loadingAmount={PAGE_SIZE}/> 
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
                    postsError && !isReachingEnd
                    ? <h5>Something went wrong</h5>
                    : null
                }

                {/* {!isLoadingMore ? <h5 ref={endRef}>{!isReachingEnd && !postsError ? "Loading more..." : null}</h5> : null } */}
                <h5 id="heading-loading-more">{!isReachingEnd && !postsError ? "Loading more..." : null}</h5>
            </center>
        </div>
    )
}