import Link from 'next/link';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import useCommunity from '../../lib/hooks/hive/useCommunity';

import {Box, Card, CardActionArea, Typography} from '@mui/material'

export default function CommunityCard({name}){

    const {data : session} = useSession();
    const { data : community} = useCommunity({name, observer : session?.user?.name});
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