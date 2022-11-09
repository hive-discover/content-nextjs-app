import {useRef, useState, useMemo, useEffect} from 'react';

import dynamic from 'next/dynamic';
import {Box, Divider} from '@mui/material'


import RowPostCardLoading from '../../components/RowPostCard/RowPostCardLoading'
import useIntersection from '../../lib/hooks/useIntersection';
const RowPostCard = dynamic(() => import('../../components/RowPostCard/RowPostCard'), {ssr: false, loading: () => <RowPostCardLoading />});

export default function BigPostContainer({posts, isLoading, fullData, loadingAmount, onInViewpoint, lazyLoading = true, ...rest}) {
    // Show loading skeleton
    if(!posts || isLoading){
        return <Box sx={{width : "100%"}}>
                    {
                        Array(loadingAmount).fill(0).map((_, index) => [
                            (<RowPostCardLoading key={index + "-1"} style={{width : "100%"}} />),
                            (<Divider key={index + "-2"} variant="middle" orientation='horizontal' />)
                        ])
                    }
            </Box>
    }

    // No posts to display
    if(posts.length === 0)
        return (<Box sx={{width : "100%", height : "10vh"}}><h4>No posts loaded.</h4></Box>);

    const postsRef = posts.map(() => useRef(null));
    const postsIntersecting = postsRef.map((v) => useIntersection(v, "+350px"));
    const [postsShouldLoad, setPostsShouldLoad] = useState(postsRef.map(() => false)); 

    useEffect(() => {
        const newPostsShouldLoad = [...postsShouldLoad];

        let shouldUpdate = false;
        postsIntersecting.forEach((intersecting, index) => {
            if(intersecting && !newPostsShouldLoad[index]){
                newPostsShouldLoad[index] = true;
                shouldUpdate = true;
            }
        });
                
        if(shouldUpdate)
            setPostsShouldLoad(newPostsShouldLoad);
    }, [postsIntersecting]);

    const getPostItem = (data, index) => {
        return useMemo(() => (<>
                <div ref={postsRef[index]}></div>
                {
                    fullData
                    ? <RowPostCard showLoading={lazyLoading && !postsShouldLoad[index]} onInViewpoint={onInViewpoint} post={data} /> 
                    : <RowPostCard showLoading={lazyLoading && !postsShouldLoad[index]} onInViewpoint={onInViewpoint} {...data} />
                }

                <Divider variant="middle" orientation='horizontal' />
            </>), [index, postsShouldLoad[index]]);
    }

    return (
        <Box>
            {
                posts.map((data, index) => getPostItem(data, index))
            }
        </Box>
    );
}