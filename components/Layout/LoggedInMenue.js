import Link from 'next/link';
import {useState} from 'react';
import { signOut } from "next-auth/react"
import dynamic from 'next/dynamic'

import {Avatar, Button, Divider, MenuItem} from '@mui/material';

const StyledMenu = dynamic(() => import('./StyledMenu'));

export default function LoggedInMenue({session}) {
    // Profile Menue State
    const [profileMenueOpen, setProfileMenuOpen] = useState(false);
    const handleProfileMenueClose = () => {
        setProfileMenuOpen(false);
    };

    return (
        <div>
            <Button
                id="avatar-dropdown-button"
                aria-controls={Boolean(profileMenueOpen) ? 'avatar-dropdown-menu' : undefined}
                aria-haspopup="true"
                aria-expanded={Boolean(profileMenueOpen) ? 'true' : undefined}
                disableElevation
                onClick={(event) => { setProfileMenuOpen(event.currentTarget) }}
            >
                <Avatar 
                src={`https://images.hive.blog/u/${session.user.name}/avatar/small`} 
                variant="rounded" 
                />
            </Button>
            
            <StyledMenu
                id="avatar-dropdown-menu"
                MenuListProps={{
                    'aria-labelledby': 'avatar-dropdown-button',
                }}
                anchorEl={profileMenueOpen}
                open={Boolean(profileMenueOpen)}
                onClose={handleProfileMenueClose}
            >
                <Link href={`/u/@${session.user.name}`} passHref>
                    <MenuItem onClick={handleProfileMenueClose}>           
                        <Button>Profile</Button>                       
                    </MenuItem>
                </Link>
                <Divider />
                <Link href={`/analytics/@${session.user.name}`} passHref>
                    <MenuItem onClick={handleProfileMenueClose}>           
                        <Button>Analytics</Button>                       
                    </MenuItem>
                </Link>
                <Divider />
                <MenuItem onClick={handleProfileMenueClose}>
                    <Button onClick={() => signOut()}>Logout</Button>
                </MenuItem>                   
            </StyledMenu>
        </div>
    )
}