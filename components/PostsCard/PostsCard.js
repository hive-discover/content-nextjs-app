import {useState, useEffect} from 'react';

import {Accordion, AccordionDetails, AccordionSummary, Divider} from '@mui/material';

import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

import Item from './Item';

export default function PostRow({title, posts}){
    const [expanded, setExpanded] = useState(false);

    if(!posts || posts.length === 0) // No Posts Found
        return null;   

    return (
        <Accordion elevation={2} expanded={expanded} onChange={()=>{setExpanded(!expanded)}}>
            <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel1a-content"
                id="panel1a-header"
            >
                <Typography>{title}</Typography>
            </AccordionSummary>
            <AccordionDetails sx={{mt : 0}}><Typography>
                {
                    posts.map((p, index) => [<Divider key={"divider-" + index} variant="middle" />, <Item key={"item-" + index} author={p.author} permlink={p.permlink}/>])
                }
            </Typography></AccordionDetails>
        </Accordion>
    );
}