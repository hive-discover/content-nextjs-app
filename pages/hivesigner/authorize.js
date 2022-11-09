import Head from 'next/head'
import Link from 'next/link';

import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';

export default function authorize({HiveSigner_LINK}) {
    
    return (
        <Container sx={{display : "flex", textAlign : "center", alignItems : "center", height : "100vh"}}>
            <Head>
                <meta http-equiv="refresh" content={`2; url=${HiveSigner_LINK}`} />
            </Head>

            <Box style={{width : "100%", alignItems : "center"}}>
                <CircularProgress />
                <h1>Redirecting to HiveSigner...</h1>

                <Divider variant="mddle" />

                <h3>If you are not redirected, click <Link href={HiveSigner_LINK}>here</Link></h3>
            </Box>
            
        </Container>
    )
}

export async function getStaticProps(context) {
    const HiveSigner_ClientId = process.env.HiveSigner_ClientId;
    const NEXTAUTH_URL = process.env.NEXTAUTH_URL;
    const HiveSigner_RedirectUri = NEXTAUTH_URL + "/hivesigner/redirect";
    const HiveSigner_LINK = `https://hivesigner.com/oauth2/authorize?client_id=${HiveSigner_ClientId}&redirect_uri=${HiveSigner_RedirectUri}&scope=vote,comment`;

    return {
        props : {
            HiveSigner_LINK
        }
    }
}