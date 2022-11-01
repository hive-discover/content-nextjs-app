/* eslint-disable react-hooks/rules-of-hooks */
import {useState} from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import Link from 'next/link';
import { useSession } from "next-auth/react"
import { useMediaQuery } from '@mui/material';
import dynamic from 'next/dynamic'
import Head from 'next/head';

import { styled, alpha, useTheme } from '@mui/material/styles';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Collapse from '@mui/material/Collapse';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import InputBase from '@mui/material/InputBase';
import MenuItem from '@mui/material/MenuItem';
import ListItem from '@mui/material/ListItem';
import List from '@mui/material/List';
import Drawer from '@mui/material/Drawer'
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import ListItemText from '@mui/material/ListItemText';

import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import Close from '@mui/icons-material/Close';
import MenuIcon from '@mui/icons-material/Menu';
import SearchIcon from '@mui/icons-material/Search';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import Person from '@mui/icons-material/Person';

const LoggedInMenue = dynamic(() => import('./LoggedInMenue'), { ssr: false });
const LoginModal = dynamic(() => import('../LoginModal/LoginModal'));
const StyledMenu = dynamic(() => import('./StyledMenu'));
const Footer = dynamic(() => import('./Footer'));

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
  [theme.breakpoints.up('sm')]: {
    marginLeft: theme.spacing(1),
    width: 'auto',
  },
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
    paddingLeft: `calc(1em + ${theme.spacing(1)})`,
    transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.up('sm')]: {
      width: '12ch',
      paddingLeft : `calc(1em + ${theme.spacing(4)})`,
      '&:focus': {
        width: '20ch',
      },
    },
  },
}));



const pageLinks = [
  {
    title : "Community",
    menuOpen : null, setMenuOpen : null, // Menu-State
    items : [
      {
        title : "Community Feed",
        href : "explore/communities",
      },
      "divider",
      // add links to his subscribeed communities
      {
        title: 'All Communities',
        href: '/c/all',
      }
    ]
  },
  {
    title : "Search",
    menuOpen : null, setMenuOpen : null, // Menu-State
    items : [
      {
        title : "Posts",
        href : "/search/posts",
      },
      "divider",
      {
        title: 'Accounts',
        href: '/search/accounts',
      },
      "divider",
      {
        title: 'Stock Images',
        href: '/search/stockimages',
      }
    ]
  },
  {
    title : "Explore",
    href : "/explore",
    endIcon : null
  }
]

const addPageLinksNotMobile = (items, menuOpen, setMenuOpen) => {
  if(!items) return;

  const handleClose = () => {
    setMenuOpen(false);
  };

  return (
    <StyledMenu
      id="demo-customized-menu"
      MenuListProps={{
        'aria-labelledby': 'demo-customized-button',
      }}
      anchorEl={menuOpen}
      open={Boolean(menuOpen)}
      onClose={handleClose}
    >
      {items.map((item, index) => {
        if (item === 'divider') {
          return <Divider key={index} />
        } else {
          return (
            <Link href={item.href} passHref>
              <MenuItem key={index} onClick={handleClose}>             
                <Button>{item.title}</Button>            
              </MenuItem>
            </Link>
          )
        }
      })}
    </StyledMenu>
  );
}

const addPageLinksMobile = (parent_link, link_index) => {
  if(!parent_link.items){
    // We have a Simple Link
    return (
      <Link href={parent_link.href} passHref>
      <ListItem button key={link_index}>      
          <ListItemText primary={parent_link.title} />       
        </ListItem>
      </Link>
    );
  }

  // Create nested list
  return [(
    <ListItem button onClick={()=>{parent_link.setMenuOpen(!parent_link.menuOpen);}} key="0">
      <ListItemText primary={parent_link.title} />
      {parent_link.menuOpen ? <ExpandLess /> : <ExpandMore />}
    </ListItem>
    ),(
    <Collapse in={parent_link.menuOpen} timeout="auto" unmountOnExit key="1">
      <List component="div" disablePadding  sx={{ pl: 4 }}>
        {parent_link.items.map((item, index) => {
          if (item === 'divider') {
            return <Divider key={index} />
          } else {
            return (
              <Link href={item.href} key={index} passHref>
                <ListItem button key={index}>                
                  <ListItemText primary={item.title} key={index} />               
                </ListItem>
              </Link>
              )
            }
          })}
      </List>
    </Collapse>
    )];
}

const onClickGoSearch = (e, router, search_query) => {
  if(e) e.preventDefault();
  if(!search_query || search_query.length < 2) return;

  router.push({ pathname: ('/search/' + search_query)}, undefined, {scroll : true});
}

const drawerWidth = 350;

const getPreloads = (session)=>{
  if(!session)
    return null;

  return (<Head>
    <link rel="preload" href="/explore" as="fetch"></link>

    <link rel="preload" href="/explore/all" as="fetch"></link>
    <link rel="preload" href="/explore/tags" as="fetch"></link>
    <link rel="preload" href="/explore/communities" as="fetch"></link>

    <link rel="preload" href="/explore/trending" as="fetch"></link>
    <link rel="preload" href="/explore/hot" as="fetch"></link>
    <link rel="preload" href="/explore/new" as="fetch"></link>
  </Head>);
}

export default function Layout({children, loginModalState = null, ...props}) {
  const router = useRouter();
  const theme = useTheme();
  const useSideDrawer = useMediaQuery(theme.breakpoints.down('md'));

  // Get Session and maybe Account
  const { data: session } = useSession();
  const [searchQuery, setSearchQuery] = useState('');

  // Mobile SideDrawer State
  const [sideDrawerOpen, setSideDrawerOpen] = useState(false);

  // Create States for the menues
  pageLinks.forEach((value, index) => {
    if(!value.items) return; // Not a menu
    [pageLinks[index].menuOpen, pageLinks[index].setMenuOpen] = useState(false);
  });

  // Login Modal Opened
  const [loginModalOpen, setLoginModalOpen] = (loginModalState || useState(false));

  return (
    <>
      {getPreloads(session)}

      <Box sx={{ flexGrow: 1 }}>
        <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
          <Toolbar>
            <Box sx={{ mr: 2, display: { sm: 'flex', md: 'none' }}}>
              <IconButton
                size="large"
                edge="start"
                color="inherit"
                aria-label="open drawer"
                id="mobile-sidebar-open-button"
                aria-controls={Boolean(sideDrawerOpen) ? 'mobile-sidebar-dropdown-menu' : undefined}
                aria-haspopup="true"
                aria-expanded={Boolean(sideDrawerOpen) ? 'true' : undefined}
                disableElevation
                onClick={()=>{setSideDrawerOpen(!sideDrawerOpen);}}
              >
                <MenuIcon />
              </IconButton>   
            </Box>                

            <Link href={session ? "/explore" : "/"} passHref>
              <Button>
                <Image 
                  src="/img/Logo/IconOnly.png" 
                  alt="" 
                  height={40} 
                  width={40} 
                />   
              </Button>  
            </Link>  

            <Divider variant="middle" orientation="vertical" flexItem style={{ margin : 10, borderWidth : 1}}/>

            <Typography
              variant="h6"
              noWrap
              component="div"
              sx={{ flexGrow: 1, display: { xs: 'none', sm: 'flex' } }}
              style={{alignContent: 'center'}}
            >
              Hive Discover
            </Typography>

            <Box 
              sx={{ flexGrow: 1, display: { xs : 'none', sm : 'none', md: 'flex' } }}
              style={{alignContent: 'center'}}
            >
              {/* Map all pageLinks into this box when it is a big display */}
              {
                useSideDrawer ? null : (pageLinks.map((value, index) => { 
                  const open = Boolean(value.menuOpen);

                  return (                   
                    <div key={index}>
                      <Button
                        id="demo-customized-button"
                        aria-controls={open ? 'demo-customized-menu' : undefined}
                        aria-haspopup="true"
                        aria-expanded={open ? 'true' : undefined}
                        disableElevation
                        onClick={(event) => { if(value.items) value.setMenuOpen(event.currentTarget); else router.push(value.href); }}
                        endIcon={value.items ? <KeyboardArrowDownIcon /> : value.endIcon}
                      >
                        {value.title}
                      </Button>

                      {addPageLinksNotMobile(value.items, value.menuOpen, value.setMenuOpen)}
                    </div>
                  )
                }))
              }
            </Box>          

            <Search>
              <SearchIconWrapper sx={{ flexGrow: 1, display: { xs: 'none', sm: 'flex' } }}>
                <SearchIcon />
              </SearchIconWrapper>
              <StyledInputBase
                placeholder="Search…"
                inputProps={{ 'aria-label': 'search' }}
                value={searchQuery}
                onChange={(event) => {setSearchQuery(event.target.value);}}
                onKeyPress={(event) => {if(event.key === "Enter"){onClickGoSearch(event, router, searchQuery);}}} 
              />
              <Button onClick={(e)=>{onClickGoSearch(e, router, searchQuery)}}>Go</Button>
            </Search>
                  
            <Divider variant="middle" orientation="vertical" flexItem style={{ margin : 10, borderWidth : 1}}/>

            <Box style={{alignContent: 'center'}}>
              {session
                ? <LoggedInMenue session={session} setLoginModalOpen={setLoginModalOpen} />
              : (
                <Button
                  onClick={() => setLoginModalOpen(!loginModalOpen)}
                  endIcon={<Person />}
                  variant="contained"
                  disableElevation
                >
                  Login
                </Button>
              )}  
            </Box>
          </Toolbar>
        </AppBar>

        <Drawer
          anchor="left"
          open={sideDrawerOpen}
          onClose={()=>{setSideDrawerOpen(false)}}
          sx={{minWidth: drawerWidth, flexShrink: 0, [`& .MuiDrawer-paper`]: { minWidth: drawerWidth, boxSizing: 'border-box' }}}
        >
          <Toolbar/>
          <Box sx={{ overflow: 'auto' }}>
            <List>
              <ListItem button onClick={()=>{setSideDrawerOpen(false)}}>
                <ListItemText primary="" />
                  <Close/>
              </ListItem>

              <Divider/>

              {/* Render the links when it is in a small display  */}
              {!useSideDrawer ? null : pageLinks.map((value, index) => {
                return [addPageLinksMobile(value, index), (<Divider key={index}/>)];
              })}
            </List>
          </Box>
        </Drawer> 
      </Box>
            
      {/* Login Modal  */}
      {loginModalOpen ? <LoginModal isOpen={loginModalOpen} setIsOpen={setLoginModalOpen} /> : null}

      {/* Set the children here + Placeholder to not let the content stay behind the Toolbar */}
      <Box sx={{minHeight : "100vh"}}>
        <Toolbar />
        {children}
      </Box>
      
      <Divider />

      {/* Add the Footer */}
      <Footer />
    </>
  );
}
