import { useRouter } from "next/router";
import Link from "next/link";
import Head from "next/head";
import {useSession} from "next-auth/react";
import useSWR from "swr";
import { useEffect } from "react";

import Avatar from "@mui/material/Avatar";
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import Tab from '@mui/material/Tab';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';
import Typography from '@mui/material/Typography';
import Skeleton from '@mui/material/Skeleton';

import BigPostContainer from "../../components/BigPostContainer/BigPostContainer";

import {chooseCommunityMode, logOnInViewpoint} from '../../lib/exploration'
import useCommunity from "../../lib/hooks/hive/useCommunity";
import useAccount from "../../lib/hooks/hive/useAccount";
import {getDeviceKeyEncodedMessage} from '../../lib/backendAuth';
import { CircularProgress } from "@mui/material";

const modeToTabIndex = {
    "explore" : 0,
    "trending" : 1,
    "new" : 2,
    "hot" : 3,
    "muted" : 4
};

const modeToTabTitle = {
    "explore" : "Explore",
    "trending" : "Trending",
    "new" : "New",
    "hot" : "Hot",
    "muted" : "Muted"
};

export default function CommunityIndex({setPreTitle = null}){
    const router = useRouter();

    const {data : session, status : sessionStatus} = useSession();
    const {data : msg_encoded} = useSWR(session, getDeviceKeyEncodedMessage, {refreshInterval : 60});

    const [communityName, postsMode = session ? "explore" : "trending"] = router.query?.params || [];
    const modeIsLoading = (!router.isReady || sessionStatus === "loading" || (session && !msg_encoded));

    const {data : community, error : communityError} = useCommunity({name : communityName, observer : session?.user.name});
    const {data : communityAccount, error : communityAccountError} = useAccount({name : communityName, observer : session?.user.name});
    const communityIsLoading = (modeIsLoading || (!community && !communityError) || (!communityAccount && !communityAccountError));

    const {title : postsTitle, dataHook, allowed, logInViewpoint} = chooseCommunityMode(community || {}, postsMode, session, modeIsLoading, msg_encoded);
    const {data : hookData, error : hookError, isValidating, mutate} = dataHook();
    const postsAreLoading = (!hookData && !hookError);

    if(communityError || communityAccountError){
        return <Container>
            <center>
                <Typography variant="h4" component="h1" gutterBottom>
                    Something went wrong: <small>{communityError?.message || communityAccountError?.message}</small>
                </Typography>
            </center>
        </Container>
    }

    const communityMetadata = communityAccount?.posting_json_metadata?.profile || {};
    if(community)
        community.created_at = new Date(community.created_at);

    useEffect(()=>{
        if(community && setPreTitle)
            setPreTitle(community.title + (community.title.includes("Community") ? "" : " Community"));
    }, [community, communityAccount]);

    return (
        <>
        <Head>
            {community?.about && <meta property="description" content={community.about} />}
            {community?.title && <meta property="og:title" content={community.title} />}
            {community?.about && <meta property="og:description" content={community.about} />}
            {community && <meta property="og:image" content={`https://images.hive.blog/u/${communityName}/avatar/large`} />}
        </Head>

        <Container>
            <Box sx={{
                    minHeight : {xs : "30vh", sm : "40vh", md : "50vh"}, 
                    width : "100%", 
                    background : `url(${communityMetadata.cover_image ? "/api/imageProxy?imageUrl=" + communityMetadata.cover_image : "/img/blank-cover-image.svg"})`,
                    backgroundSize : "cover",
                    backgroundPosition : "center",
                    backgroundRepeat : "no-repeat",
                    p : 3,
                    alignItems : "center",
                    justifyContent : "center",
                    display : "flex",
                }}
            >
                <Card sx={{ display: 'flex', opacity : 0.95, width : "100%"}}>
                    <Box sx={{ display: 'flex', flexDirection: 'column'}}>
                        <CardContent>
                            <Avatar
                                src={`https://images.hive.blog/u/${communityName}/avatar/medium `}
                                sx={{
                                    width: '130px',
                                    height: '130px',
                                }}
                            />                   
                        </CardContent>
                    </Box> 

                    <Box sx={{ display: 'flex', flexDirection: 'column', width : "100%" }}>
                        <CardContent>
                            <Typography variant="h4" component="h2">
                                <strong>{community ? community.title : <Skeleton variant="text" width="100%"/>}</strong>
                            </Typography>

                            <Divider/>

                            <Typography variant="subtitle1" component="h5">
                                {community ? community.about : <Skeleton variant="text" count={1} width="100%"/>}
                            </Typography>
                            <br/>                            
                            <Typography variant="subtitle2" component="span">
                                {community ? community.description : <Skeleton variant="text" count={5} width="100%"/>}
                            </Typography>

                            <Typography variant="body2" component="span" sx={{textAlign : "center", textJustify : "center"}} >
                                <Grid container spacing={2} sx={{mt : 2}} justifyContent="center">
                                    <Grid item sm={6} md={2}>                                        
                                        <strong>Language</strong> <br/> {community ? community.lang.toUpperCase() : "/"}
                                    </Grid>                          

                                    <Grid item sm={6} md={2}>                                        
                                        <strong>Members</strong> <br/> {community ? community.subscribers : "/"}
                                    </Grid>

                                    <Grid item sm={6} md={2}>                                        
                                        <strong>Since</strong> <br/> {community ? ((community.created_at.getMonth() + 1) + "/" + community.created_at.getFullYear()) : "/"}
                                    </Grid>


                                    <Grid item sm={6} md={2}>                                        
                                        <strong>Interactions</strong> <br/> {community ? community.num_pending : "/"}
                                    </Grid>

                                </Grid>   
                            </Typography>  

                        </CardContent>   
                    </Box>     
                </Card>
            </Box>

            <Divider />
            <Box sx={{ width: '100%', typography: 'body1' }}>
                <TabContext value={modeToTabIndex[postsMode]}>
                    <Box sx={{ borderBottom: 1, borderColor: 'divider' }} >
                        <TabList oaria-label="lab API tabs example" centered>                            
                            {
                                Object.keys(modeToTabIndex).map((mode) => {
                                    if(!chooseCommunityMode(community || {}, mode, session, modeIsLoading, msg_encoded).allowed)
                                        return null;

                                    return (<Link href={`/c/${communityName}/${mode}`} scroll={false} passHref>
                                        <Tab label={modeToTabTitle[mode]} value="1" />
                                    </Link>)
                                })
                            }
                        </TabList>
                    </Box>
                </TabContext>
            </Box>
            

            {
                !allowed ? <center><br/><Typography variant="h5" component="h2">You must be logged in to view this content</Typography></center> : null
            }

            {
                hookError ? <center><br/><Typography variant="h5" component="h2">Error loading posts</Typography></center> : null
            }

            {
                allowed ? <BigPostContainer posts={hookData?.posts} loading={postsAreLoading} loadingAmount={25} fullData={true}/> : null
            }
        </Container></>
    )
}