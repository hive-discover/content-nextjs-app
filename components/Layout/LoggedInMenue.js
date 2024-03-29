import Link from 'next/link';
import {useState, useEffect} from 'react';
import { signOut, useSession } from "next-auth/react"
import dynamic from 'next/dynamic'

import {sessionHasPostingPermission, verfiyDeviceKey} from '../../lib/backendAuth'
import {Avatar, Button, Divider, MenuItem} from '@mui/material';

const StyledMenu = dynamic(() => import('./StyledMenu'));

export default function LoggedInMenue({session, setLoginModalOpen}) {
    // Profile Menue State
    const [profileMenueOpen, setProfileMenuOpen] = useState(false);
    const handleProfileMenueClose = () => {
        setProfileMenuOpen(false);
    };

    useEffect(()=>{
        if(!session) return;

        verfiyDeviceKey(session).then((res)=>{
            // TODO: Log out if device key is not valid
        })
    }, [session]);

    return (
        <>
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
                {
                    sessionHasPostingPermission(session) === false
                    ? <MenuItem onClick={handleProfileMenueClose}>
                        <Button onClick={() => setLoginModalOpen(true)}>Add Posting Permission</Button>
                      </MenuItem> 
                    : null
                }
                <MenuItem onClick={handleProfileMenueClose}>
                    <Button onClick={() => signOut()}>Logout</Button>
                </MenuItem>                   
            </StyledMenu>
        </>
    )
}