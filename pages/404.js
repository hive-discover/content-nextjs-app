import Link from 'next/link';


import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';

export default function Home() {
  return (
    <Container sx={{display : "flex", textAlign : "center", alignItems : "center", height : "100vh"}}>
        {/* height : "100vh" */}
        <Box style={{width : "100%", alignItems : "center"}}>
            <h2>404 - This Site does not exist</h2>
            <Divider variant="mddle" />
            <Grid container spacing={1}>
                <Grid item xs={4} >
                    <Link href="/" passHref>
                        <Button variant="contained" color="primary">
                            Go Home
                        </Button>
                    </Link>
                </Grid>
                <Grid item xs={4} >
                    <Link href="/" passHref>
                        <Button variant="contained" color="primary">
                            Explore
                        </Button>
                    </Link>
                </Grid>
                <Grid item xs={4} >
                    <Link href="/" passHref>
                        <Button variant="contained" color="primary">
                            Communites
                        </Button>
                    </Link>
                </Grid>                
            </Grid>
        </Box>
    </Container>
  )
}
