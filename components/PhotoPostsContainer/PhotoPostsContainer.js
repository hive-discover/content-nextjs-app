import {useMemo} from 'react';
import dynamic from 'next/dynamic';
import {Box, Divider, Grid, Stack} from '@mui/material'

import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';

import PhotoPostCardLoading from '../../components/PhotoPostCard/PhotoPostCardLoading'

const PhotoPostCard = dynamic(() => import('../../components/PhotoPostCard/PhotoPostCard'), {ssr: false, loading: () => <PhotoPostCardLoading />});

const renderLoading = (loadingAmount)=>{
  return <Grid item xs={12} sm={6} md={4}>
    {
      Array(loadingAmount).fill(0).map((_, index) => [
        (<PhotoPostCardLoading key={index}/>)
      ])
    }
  </Grid>                   
}

export default function PhotoPostsContainer({posts, isLoading, fullData, loadingAmount = 12, ...rest}) {
  const theme = useTheme();

  const mobileDevice = useMediaQuery(theme.breakpoints.down('sm'));
  const smallDevice = useMediaQuery(theme.breakpoints.down('md'));
  const mediumDevice = useMediaQuery(theme.breakpoints.down('lg'));
  const cols = mobileDevice ? 1 : smallDevice ? 2 : mediumDevice ? 3 : 3;

  const postLists = useMemo(() => Array.from({length: cols}, (_, index) => index).map((colIndex) => {
    const list = [];

    for (let i = colIndex; i < posts?.length; i += cols){
      list.push(posts[i]);
    }
      

    return list;
  }), [posts, cols]);

  if(!posts || isLoading){
    return (
      <Grid container spacing={2} sx={{width : "100%"}}>
        {
          renderLoading(loadingAmount)
        }
      </Grid>
    )
  }

  // No posts to display
  if(!isLoading && posts.length === 0)
    return (<Box sx={{width : "100%", height : "10vh"}}><h4>No posts loaded.</h4></Box>);

  const getColumn = (colIndex) => {
    return (
      <Grid item xs={12} sm={6} md={4}>
        <Stack
          direction="column"
          alignItems="center"
          divider={<Divider orientation="vertical" flexItem />}
          spacing={5}
        >
          {
            postLists[colIndex].map((data, index) => {
                return fullData ? <PhotoPostCard post={data} /> : <PhotoPostCard {...data} />
              })
            }
        </Stack>
      </Grid>
    );
  }

  return (
      <Box sx={{width : "100%"}}>
          <Grid container spacing={5} padding={3}>
            {
              Array.from({length: cols}, (_, index) => index).map((colIndex) => getColumn(colIndex))
            }
          </Grid>
      </Box>
  );
}