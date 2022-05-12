import { useSession } from 'next-auth/react'
import useSWR from 'swr'
import Link from 'next/link'

import Container from '@mui/material/Container'
import Button from '@mui/material/Button'

export default function explore(props){
    
    const {data : session} = useSession()

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
            LOGIN Show Normal Feed
                <small>
                    <Link href="/explore/feed">
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