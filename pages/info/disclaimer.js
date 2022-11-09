import Image from 'next/image';
import Link from 'next/link';

import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography';
import ListItem from '@mui/material/ListItem';
import Divider from '@mui/material/Divider';
import ListItemText from '@mui/material/ListItemText';

export default function disclaimer(props){

    return (
        <Container>
            <Box sx={{display : "flex", textAlign : "center", alignItems : "center", minHeight : "65vh"}}>     
                <h1 style={{width : "100%"}}>Disclaimer</h1>
            </Box>

            <Divider />
            
<h2>1. Disclaimer</h2>

As a service provider, we are responsible for our own content on these pages in accordance with the general laws pursuant to § 7 Para.1 TMG. According to §§ 8 to 10 TMG, we are not obligated to monitor transmitted or stored information or to investigate circumstances that indicate illegal activity.
Obligations to remove or block the use of information under the general laws remain unaffected. However, liability in this regard is only possible from the point in time at which a concrete infringement of the law becomes known. If we become aware of any such infringements, we will remove the relevant content immediately. Therefore, we ask you to report such information by e-mail.
<h2>2. Liability for links</h2>

Our offer contains links to external websites of third parties, on whose contents we have no influence. Therefore, we cannot assume any liability for these external contents. The respective provider or operator of the sites is always responsible for the content of the linked sites. The linked pages were checked for possible legal violations at the time of linking. Illegal contents were not recognizable at the time of linking.
However, a permanent control of the contents of the linked pages is not reasonable without concrete evidence of a violation of the law. If we become aware of any infringements, we will remove such links immediately. Therefore, we ask you to report inappropriate or illegal links to us by e-mail.
<h2>3. Copyright</h2>

The contents and works created by the site operators on these pages are subject to German copyright law. Duplication, processing, distribution, or any form of commercialization of such material beyond the scope of the copyright law shall require the prior written consent of its respective author or creator. Downloads and copies of this site are only permitted for private, non-commercial use.
Insofar as the content on this site was not created by the operator, the copyrights of third parties are respected. In particular, third-party content is identified as such. Should you nevertheless become aware of a copyright infringement, please inform us accordingly. If we become aware of any infringements, we will remove such content immediately.

<br/><br/>
        </Container>
    )
}