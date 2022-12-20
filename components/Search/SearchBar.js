import {useState} from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import dynamic from 'next/dynamic';

import { styled, alpha } from '@mui/material/styles';

import { Box, Button, Divider, CircularProgress, Grid, InputBase, Typography, Stack, Paper } from "@mui/material";
import SearchIcon from '@mui/icons-material/Search';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';

import {onClickGo, getSearchMeta, createLinkFromSearchMeta, SEARCH_BASES, TIME_RANGES} from '../../lib/search';
import { useEffect } from 'react';

const PostSearchForm = dynamic(() => import('./PostSearchForm'), {ssr: false, loading: () => <center><CircularProgress sx={{m : 5}}/></center>});

const Search = styled('div')(({ theme }) => ({
    position: 'relative',
    display : "flex",
    borderRadius: theme.shape.borderRadius,
    backgroundColor: alpha(theme.palette.common.white, 0.15),
    '&:hover': {
      backgroundColor: alpha(theme.palette.common.white, 0.25),
    },
    marginLeft: 0,
    width: '100%',
}));
  
const SearchIconWrapper = styled('div')(({ theme }) => ({
    padding: theme.spacing(0, 2),
    height: '100%',
    position: 'absolute',
    pointerEvents: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
}));
  
const StyledInputBase = styled(InputBase)(({ theme }) => ({
    color: 'inherit',
        '& .MuiInputBase-input': {
            padding: theme.spacing(1, 1, 1, 0),
            // vertical padding + font size from searchIcon
            paddingLeft: `calc(1em + ${theme.spacing(4)})`,
            transition: theme.transitions.create('width'),
            width: '100%',            
        },
}));

const searchOption = (label, values, value, setValue) => {
    return (
        <Box sx={{ minWidth: 120 }}>
            <FormControl fullWidth>
                <InputLabel id={"search-select-label" + label}>{label}</InputLabel>
                <Select
                    labelId={"search-select-label" + label}
                    id={"search-select-" + label}
                    value={value}
                    label={label}
                    onChange={(event) => setValue(event.target.value)}
                    >
                        {
                        values.map((value) => {
                            return <MenuItem value={value}>{value}</MenuItem>
                        })
                        }
                </Select>
            </FormControl>
        </Box>
  );
}


export default function SearchBar(){
    const router = useRouter();
    
    const {base, time_range, query} = getSearchMeta(router?.query?.params)

    const [queryValue, setQueryValue] = useState(query);
    const [baseValue, setBaseValue] = useState(base);
    const [timeRangeValue, setTimeRangeValue] = useState(time_range);

    useEffect(() => {
        setQueryValue(query)
    }, [router])

    return (
        <Box sx={{width : "100%"}}>
            <Grid container>
                <Grid item xs={12}>
                    <Typography component="h3" variant="h3">
                        Search on HIVE
                    </Typography>
                    <Typography component="h3" variant="subtitle">
                        Posts & Images - all in one place
                    </Typography>
                </Grid>

                <Divider sx={{mb : 5}} variant="middle" flexItem/>

                <Grid item xs={12} sx={{pl : {sm : 2, md : 3}, pr : {sm : 2, md : 3}}}>
                    <Search>
                        <SearchIconWrapper>
                            <SearchIcon />
                        </SearchIconWrapper>
                        <StyledInputBase
                            placeholder="Search…"
                            inputProps={{ 'aria-label': 'search' }}
                            value={queryValue}
                            sx={{width : "100%"}}
                            onChange={(event) => {setQueryValue(event.target.value);}}     
                            onKeyPress={(event) => {if(event.key !== "Enter") return; router.push(createLinkFromSearchMeta(base, time_range, queryValue))}}                       
                        />
                    </Search>                                       
                </Grid>

                <Grid item xs={12} sx={{pl : {sm : 2, md : 3}, pr : {sm : 2, md : 3}, mt : 5}}>
                    <Stack
                        direction="row"
                        justifyContent="space-evenly"
                        alignItems="center"
                        divider={<Divider orientation="vertical" flexItem />}
                    >
                        {searchOption("Base", SEARCH_BASES, baseValue, setBaseValue)}
                        {baseValue !== "stockimages" ? searchOption("Time Range", TIME_RANGES, timeRangeValue, setTimeRangeValue) : null}
                        
                        <Link href={createLinkFromSearchMeta(baseValue, timeRangeValue, queryValue)} passHref>
                            <Button variant="contained" color="primary" sx={{mt : 3, width : "40vh"}}>Go!</Button>
                        </Link>
                    </Stack>
                </Grid>
            </Grid>
        </Box>
    );
}