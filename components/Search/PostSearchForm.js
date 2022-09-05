import { useState} from 'react';
import { useRouter } from 'next/router';

import { Button, Grid, FormControl, InputLabel, Input, FormHelperText, Select, MenuItem, Tooltip } from "@mui/material";

import {onClickGo} from '../../lib/search';

export default function form({queryValue, setQueryValue}){
    const router = useRouter();

    const [inputAuthors, setInputAuthors] = useState(queryValue.options?.authors || []);
    const [inputTags, setInputTags] = useState(queryValue.options?.tags || []);
    const [inputParentPermlinks, setInputParentPermlinks] = useState(queryValue.options?.parent_permlinks || []);

    return (
        <Grid container sx={{m : 1, width : "100%"}} justifyContent="center" alignItems="center" spacing={3}>
            <Grid item xs={12} md={3} sx={{p : 3}}>
                <FormControl variant="standard" sx={{width : "100%"}}>
                    <InputLabel htmlFor="component-simple">By Authors</InputLabel>
                    <Input 
                        id="post-input-authors"
                        value={inputAuthors.join(" ")} 
                        onChange={(e) => setInputAuthors(e.target.value.split(" ").map(a => a.trim().replace("@", "")))}
                        onBlur={(e) => setQueryValue({...queryValue, authors : inputAuthors})}
                        onKeyPress={(event) => {if(event.key === "Enter"){onClickGo(router, queryValue, "posts");}}} 
                        aria-describedby="post-input-authors-helper" 
                    />
                    <FormHelperText id="post-input-authors-helper">
                        Separate authors with spaces
                    </FormHelperText>
                </FormControl>
            </Grid>

            <Grid item xs={12} md={3} sx={{p : 3}}>
                <FormControl variant="standard" sx={{width : "100%"}}>
                    <InputLabel htmlFor="post-input-tags">Tags to include</InputLabel>
                    <Input
                        id="post-input-tags"
                        value={inputTags.join(" ")} 
                        onChange={(e) => setInputTags(e.target.value.split(" ").map(a => a.trim().replace("@", "")))}
                        onBlur={(e) => setQueryValue({...queryValue, tags : inputTags})}
                        onKeyPress={(event) => {if(event.key === "Enter"){onClickGo(router, queryValue, "posts");}}} 
                        aria-describedby="post-input-tags-helper"
                    />
                    <FormHelperText id="post-input-tags-helper">
                        Separate tags with spaces
                    </FormHelperText>
                </FormControl>
            </Grid>

            <Grid item xs={12} md={3} sx={{p : 3}}>
                <FormControl variant="standard" sx={{width : "100%"}}>
                    <InputLabel htmlFor="post-input-langs">Categories</InputLabel>
                    <Input
                        id="post-input-categories"
                        value={inputParentPermlinks.join(" ")} 
                        onChange={(e) => setInputParentPermlinks(e.target.value.split(" ").map(a => a.trim().replace("@", "")))}
                        onBlur={(e) => setQueryValue({...queryValue, parent_permlinks : inputParentPermlinks})}
                        onKeyPress={(event) => {if(event.key === "Enter"){onClickGo(router, queryValue, "posts");}}} 
                        aria-describedby="post-input-categories-helper"
                    />
                    <FormHelperText id="post-input-categories-helper">
                        Separate categories with spaces
                    </FormHelperText>
                </FormControl>
            </Grid>

            <Grid item xs={12} md={2} sx={{p : 3}}>
                <FormControl fullWidth>
                    <InputLabel id="demo-simple-select-label">Sort mode</InputLabel>
                    <Select
                        labelId="demo-simple-select-label"
                        id="demo-simple-select"
                        value={"smart"}
                        label="Sort mode"
                        // onChange={handleChange}
                    >
                        <MenuItem value="smart">Smart</MenuItem>
                        <MenuItem value="relevance">Relevance</MenuItem>
                        <MenuItem value="latest">Latest</MenuItem>
                        <MenuItem value="oldest">Oldest</MenuItem>
                    </Select>
                </FormControl>
            </Grid>

            <Grid item xs={12} md={1} sx={{p : 3}}>
                <Tooltip title="Clear Search Form">
                    <Button 
                        variant="contained" 
                        color="primary" 
                        sx={{width : "100%"}}
                        onClick={()=>{setQueryValue({}); setInputAuthors([]); setInputParentPermlinks([]), setInputTags([]);}}
                    >
                            X
                    </Button>
                </Tooltip>
            </Grid>
        </Grid>
    )
}