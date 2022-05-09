import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';

import Login from '@mui/icons-material/Login';

export default function Home() {
  return (
    <div style={{backgroundImage : 'url(/img/blob-scene-1.svg)', backgroundSize : "cover", backgroundClip : "no-repeat", height : "100vh"}}>
      <Container sx={{paddingTop : {xs : "10vh", sm : "15vh", md : "20vh"}}}>
        <Grid container>
          <Grid item sm={8} md={6} >
            <h1>Discover HIVE AI supported</h1>
            <Divider variant="middle" />
            <h3>Our AI reviews all the content on HIVE and tries to suggest you the most interesting posts based on your activities - Sign up for the best experience</h3>
            <Button 
              variant="contained" 
              color="primary" 
              size="large" 
              sx={{float : {xs : "right", sm : "right", md : "left"}}}
              onClick={() => alert("Sign up")}
            >
              <Login /> &nbsp;&nbsp; Login with your HIVE Account
            </Button>
          </Grid>
        </Grid>
      </Container>
    </div>
  )
}
