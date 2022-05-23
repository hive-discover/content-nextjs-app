import Link from 'next/link';
import useSWR from 'swr';

import {Chip} from '@mui/material';

export default function CategoryChip({category}){

    const { data : community} = useSWR(`/api/getCommunity/${category}`, (url) => fetch(url).then(r => r.json()));
    const isCommunity = community && community.title && !community.error;
    const href = isCommunity ? `/c/${category}` : `/tag/${category}`;

    return(
        <Link href={href} passHref>
            <Chip label={isCommunity ? community.title : "#" + category} onClick={()=>{}}/>
        </Link>
    )
}