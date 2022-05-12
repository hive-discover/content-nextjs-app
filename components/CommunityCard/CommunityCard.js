import Link from 'next/link';
import Image from 'next/image';
import useSWR from 'swr';

import {Box, Card, CardActionArea, Typography} from '@mui/material'

export default function CommunityCard({name}){

    const { data : community} = useSWR(`/api/getCommunity/${name}`, (url) => fetch(url).then(r => r.json()));
    const isCommunity = community && community.title && !community.error;

    if(!isCommunity)
        return null;

    return (
        <Card>
            <Link href={`/c/${name}`} passHref>
                <CardActionArea sx={{p : 1, display : "flex", alignItems : "center", justifyContent : "flex-start"}}>
                    <Image src={`https://images.hive.blog/u/${name}/avatar/small`} width={64} height={64} style={{borderRadius : 35}}/>
                    &nbsp;&nbsp;
                    <Box>
                        <Typography variant="h6">C/{community.title}</Typography>   
                        <Typography variant="caption">C/{community.about}</Typography>   
                    </Box>
                </CardActionArea>
            </Link>
        </Card>
    );
}