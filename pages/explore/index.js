import Link from 'next/link'
import { useSession } from 'next-auth/react';
import useSWR from 'swr'

import Container from '@mui/material/Container'
import Button from '@mui/material/Button'

import {chooseMode} from '../../lib/exploration'


export default function explore(props){

    const {data : session, status : sessionStatus} = useSession();

    // Prefetch some of the explore page data
    const toPrefetch = ["all", "communities", "tags", "trending", "hot", "new"];
    toPrefetch.forEach(mode => {
        const {dataHook, allowed} = chooseMode(mode, session, false);
        if(sessionStatus !== "loading") 
        {
            if(allowed) 
            {
                dataHook();
                return;
            }          
        }
               
        // Session is loading, or the user is not allowed to see this mode
        useSWR(null, () => null); // dummy hook
    })

    return (
        <Container>
            <h1>Explore</h1>

            <p>
                LOGIN Show recommendation from anywhere
                <small>
                    <Link href="/explore/all">
                        <Button>
                            View More
                        </Button>
                    </Link>
                </small>
            </p>
            <p>
                LOGIN Show recommendations community based
                <small>
                    <Link href="/explore/communities">
                        <Button>
                            View More
                        </Button>
                    </Link>
                </small>
            </p>
            <p>
                LOGIN Show recommendations by tags
                <small>
                    <Link href="/explore/tags">
                        <Button>
                            View More
                        </Button>
                    </Link>
                </small>
            </p>
            <p>
                Show Trending Posts
                <small>
                    <Link href="/explore/trending">
                        <Button>
                            View More
                        </Button>
                    </Link>
                </small>
            </p>
            <p>
                Show New Posts
                <small>
                    <Link href="/explore/new">
                        <Button>
                            View More
                        </Button>
                    </Link>
                </small>
            </p>
            <p>
                Show Hot Posts
                <small>
                    <Link href="/explore/hot">
                        <Button>
                            View More
                        </Button>
                    </Link>
                </small>
            </p>

            <p>
                Custom Feed
                <small>
                       Let the user completly create their own feed
                </small>
            </p>
        </Container>
    )
}