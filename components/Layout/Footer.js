import Image from 'next/image';
import Link from 'next/link';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography';
import ListItem from '@mui/material/ListItem';
import Divider from '@mui/material/Divider';
import ListItemText from '@mui/material/ListItemText';

export default function Footer(){
    return (
    <footer>
        <Grid container alignItems="center">     
          <Grid item xs={6} sm={8}>
            <Grid container justifyContent="center">
              <Grid item xs={12} sm={6} md={4}>
                <ListItem button> 
                  <Link href="/about" passHref>
                    <ListItemText primary="About us" sx={{textAlign : "center"}}/>
                  </Link>
                </ListItem>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <ListItem button> 
                  <Link href="/about" passHref>
                    <ListItemText primary="Privacy Policy" sx={{textAlign : "center"}}/>
                  </Link>
                </ListItem>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <ListItem button> 
                  <Link href="/about" passHref>
                    <ListItemText primary="Impressum" sx={{textAlign : "center"}}/>
                  </Link>
                </ListItem>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <ListItem button> 
                  <Link href="/about" passHref>
                    <ListItemText primary="GitHub" sx={{textAlign : "center"}}/>
                  </Link>
                </ListItem>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <ListItem button> 
                  <Link href="https://status.hive-discover.tech" target="_blank" passHref>
                    <ListItemText primary="Server Status" sx={{textAlign : "center"}}/>
                  </Link>
                </ListItem>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <ListItem button> 
                  <Link href="https://status.hive-discover.tech" target="_blank" passHref>
                    <ListItemText primary="Server Status" sx={{textAlign : "center"}}/>
                  </Link>
                </ListItem>
              </Grid>
            </Grid>
          </Grid>   

          <Grid item xs={6} sm={4} sx={{display : "flex", textAlign : "center", alignItems : "center"}}>
            <Divider orientation="vertical" flexItem />

            <Box style={{width : "100%", alignItems : "center"}}>
              <Image
                src="/img/Logo/IconOnly.png"
                alt=""
                height={50}
                width={50}
              />
              <Typography variant="body2" color="textSecondary" component="h5">
                <ListItemText primary="Created by @action-chain"/>
              </Typography>
              <Typography variant="body2" color="textSecondary" component="h5">
                <ListItemText primary="2022 © - All rights reserved."/>
              </Typography>
              <Typography variant="body2" color="textSecondary" component="h5">
                <ListItemText primary="Version 0.0.1"/>
              </Typography>
            </Box>                        
          </Grid>       
        </Grid>
      </footer>
    )
}