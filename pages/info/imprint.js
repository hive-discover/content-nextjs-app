import Image from 'next/image';
import Link from 'next/link';

import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography';
import ListItem from '@mui/material/ListItem';
import Divider from '@mui/material/Divider';
import ListItemText from '@mui/material/ListItemText';

export default function Impressum(props){

    return (
        <Container sx={{display : "flex", textAlign : "center", alignItems : "center", height : "100vh"}}>
            <Box style={{width : "100%", alignItems : "center"}}>

            
            <h1>Impressum</h1>
            <Divider />
            <p>
                <b>Angaben gemäß § 5 TMG</b>
                <br />
                <br />
                Christopher Kock<br />
Friedlandstr. 34, 49744 Geeste<br />
+49 160 93996561<br />
hive-discover@outlook.com<br />
            </p>
            </Box>
        </Container>
    )
}