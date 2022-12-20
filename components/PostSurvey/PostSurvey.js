import {useState, useEffect} from 'react';

import {Accordion, AccordionDetails, AccordionSummary, Box, Rating} from '@mui/material';

import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ThumbDownAlt from '@mui/icons-material/ThumbDownAlt';
import ThumbUpAlt from '@mui/icons-material/ThumbUpAlt';

export default function PostSurvey({onSubmit}){

    const [hasCompleted, setHasCompleted] = useState(false);
    const [expanded, setExpanded] = useState(true);

    if(hasCompleted)
        return null;

    return (
        <Accordion elevation={2} expanded={expanded} onChange={()=>{setExpanded(!expanded)}}>
            <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel1a-content"
                id="panel1a-header"
            >
                <Typography>Post Survey</Typography>
            </AccordionSummary>
            <AccordionDetails sx={{textAlign : "center"}}>
                <Typography variant="subtitle1">Rate this post to train the recommender!</Typography>
                <Typography variant="caption">The author will not see your rating</Typography>

                <br/>

                <Box sx={{display : "flex", justifyContent : "space-evenly", alignItems : "center", mt : 5}}>
                    <ThumbDownAlt /> 
                    <Rating name="simple-controlled" value={5} size="large" onChange={(event, newValue) => {setHasCompleted(true); onSubmit && onSubmit(newValue); }} /> 
                    <ThumbUpAlt />
                </Box>

            </AccordionDetails>
        </Accordion>
    );
}