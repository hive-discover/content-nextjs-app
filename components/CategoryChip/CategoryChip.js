import Link from 'next/link';
import { useSession } from 'next-auth/react';
import useCommunity from '../../lib/hooks/hive/useCommunity';

import {Chip} from '@mui/material';

export default function CategoryChip({category}){

    const {data : session} = useSession();
    const { data : community} = useCommunity({name : category, observer : session?.user?.name});
    const isCommunity = community && community.title && !community.error;
    const href = isCommunity ? `/c/${category}` : `/tag/${category}`;

    return(
        <Link href={href} passHref>
            <Chip label={isCommunity ? community.title : "#" + category} onClick={()=>{}}/>
        </Link>
    )
}