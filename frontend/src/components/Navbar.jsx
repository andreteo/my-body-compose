import React, { useState, useContext, useEffect } from 'react';
import { ThemeContext } from '../App';
import { AppBar, Toolbar, IconButton, Typography, Menu, Container, Avatar, Button, Tooltip, MenuItem, Box, Switch, useTheme, Divider } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import MenuOpenIcon from '@mui/icons-material/MenuOpen';
import SideDrawer from './SideDrawer';
import SearchIcon from '@mui/icons-material/Search';
import { useNavigate } from 'react-router-dom';
import Metrics from '../services/metrics';
import UserContext from '../context/user'

const Navbar = (props) => {
    const navigate = useNavigate();
    const theme = useTheme();
    const settings = ['Profile', 'Logout'];
    const settingsNotSignedIn = ['Login'];
    const [anchorElNav, setAnchorElNav] = useState(null)
    const [anchorElUser, setAnchorElUser] = useState(null);
    const [drawerList, setDrawerList] = useState(["myDashboard", "myComposition", "myCalories", "myWorkout"]);
    const themeCtx = useContext(ThemeContext);
    const userCtx = useContext(UserContext);


    const handleOpenUserMenu = (event) => {
        setAnchorElUser(event.currentTarget);
    };

    const handleCloseUserMenu = () => {
        setAnchorElUser(null);
    };

    const handleSwitchChange = () => {
        themeCtx.setDarkMode(prevState => !prevState);
    }


    const handleMenuItemClick = (setting) => {
        switch (setting) {
            case "Login":
                navigate('/');
                userCtx.setShowLogin(true);
                break;
            case "Logout":
                userCtx.setAccessToken("");
                userCtx.setIsSignedIn(false);
                userCtx.setShowLogin(true);
                navigate('/');
                break
            case "Profile":
                navigate('/profile');
                break;
        }
    }

    return (
        <AppBar position="static">
            <Container maxWidth="large">
                <Toolbar sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <IconButton onClick={() => navigate('/')} style={{ backgroundColor: 'transparent' }}>
                        <Typography
                            variant="h5"
                            noWrap
                            sx={{
                                fontFamily: 'monospace',
                                fontWeight: 700,
                                letterSpacing: '.4rem',
                                color: theme.palette.text.primary
                            }}
                        >
                            MBC
                        </Typography>
                    </IconButton>

                    {userCtx.accessToken.length !== 0 && (
                        <Tooltip title="Search Users">
                            <IconButton onClick={() => { console.log("TODO: Implement User Search Function") }} sx={{ p: 0, color: theme.palette.primary.contrastText }}>
                                <SearchIcon />
                            </IconButton>
                        </Tooltip>
                    )}
                </Toolbar>

                <Divider orientation='horizontal' variant='middle' flexItem sx={{ backgroundColor: theme.palette.text.primary, borderBottomWidth: "1px" }} />

                <Toolbar disableGutters sx={{ padding: "0 1rem 0 1rem", display: "flex", justifyContent: "flex-end" }}>
                    {/* <IconButton sx={{ mr: 2, display: { lg: "none", md: "flex", xs: "flex" }, color: theme.palette.text.primary }} size="large" onClick={() => handleToggleDrawer(true)}>
                        {openDrawer ? <MenuOpenIcon /> : <MenuIcon />}
                    </IconButton> */}

                    {/* <SideDrawer
                        openDrawer={openDrawer}
                        setOpenDrawer={setOpenDrawer}
                        drawerList={drawerList}
                        setDrawerList={setDrawerList}
                        handleToggleDrawer={handleToggleDrawer}>
                    </SideDrawer> */}


                    {userCtx.accessToken.length !== 0 && (
                        <Box sx={{ display: "flex", justifyContent: "space-evenly", flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
                            {drawerList.map((page) => (
                                <Button
                                    key={page}
                                    onClick={() => {
                                        page === "myDashboard" && navigate('/');
                                        page === "myComposition" && navigate('/composition');
                                        page === "myCalories" && navigate('/calories');
                                        page === "myWorkout" && navigate('/workout');
                                    }}
                                    sx={{
                                        my: 2,
                                        mr: 1,
                                        color: theme.palette.text.primary,
                                        display: 'block',
                                        '&:hover': {
                                            backgroundColor: theme.palette.primary.accent2,
                                        }
                                    }}
                                >
                                    {page}
                                </Button>
                            ))}
                        </Box>
                    )}

                    <Box sx={{ flexGrow: 0 }}>
                        {themeCtx.darkMode && <DarkModeIcon />}
                        {!themeCtx.darkMode && <LightModeIcon />}
                        <Tooltip title='Toggle Light/Dark Mode'>
                            <Switch onChange={handleSwitchChange} color='main' />
                        </Tooltip>

                        {userCtx.accessToken.length !== 0 && (
                            <>
                                {userCtx.isSignedIn && (
                                    <Tooltip title="User Profile">
                                        <IconButton onClick={handleOpenUserMenu} sx={{ p: 0, color: theme.palette.primary.contrastText }}>
                                            <Avatar src={"data:image/jpeg;base64," + userCtx.userProfile.profile_photo} alt="User Avatar" sx={{ backgroundColor: theme.palette.primary.avatar, color: theme.palette.text.primary }} />
                                        </IconButton>
                                    </Tooltip>
                                )}

                                {!userCtx.isSignedIn && (
                                    <Tooltip title="Not signed in">
                                        <IconButton onClick={handleOpenUserMenu} sx={{ p: 0, color: theme.palette.primary.contrastText }}>
                                            <Avatar alt="User Avatar" sx={{ backgroundColor: theme.palette.primary.avatar, color: theme.palette.text.primary }} />
                                        </IconButton>
                                    </Tooltip>
                                )}

                                <Menu
                                    sx={{ mt: '45px' }}
                                    id="menu-appbar"
                                    anchorEl={anchorElUser}
                                    anchorOrigin={{
                                        vertical: 'top',
                                        horizontal: 'right',
                                    }}
                                    keepMounted
                                    transformOrigin={{
                                        vertical: 'top',
                                        horizontal: 'right',
                                    }}
                                    open={Boolean(anchorElUser)}
                                    onClose={handleCloseUserMenu}
                                >
                                    {settings.map((setting) => (
                                        <MenuItem key={setting} onClick={() => handleMenuItemClick(setting)}>
                                            <Typography textAlign="center" color={theme.palette.text.dark}>
                                                {setting}
                                            </Typography>
                                        </MenuItem>
                                    ))}
                                </Menu></>
                        )}

                        {!userCtx.isSignedIn && (
                            <>
                                <Tooltip title="Not signed in">
                                    <IconButton onClick={handleOpenUserMenu} sx={{ p: 0, color: theme.palette.primary.contrastText }}>
                                        <Avatar alt="User Avatar" sx={{ backgroundColor: theme.palette.primary.avatar, color: theme.palette.text.primary }} />
                                    </IconButton>
                                </Tooltip>

                                <Menu
                                    sx={{ mt: '45px' }}
                                    id="menu-appbar"
                                    anchorEl={anchorElUser}
                                    anchorOrigin={{
                                        vertical: 'top',
                                        horizontal: 'right',
                                    }}
                                    keepMounted
                                    transformOrigin={{
                                        vertical: 'top',
                                        horizontal: 'right',
                                    }}
                                    open={Boolean(anchorElUser)}
                                    onClose={handleCloseUserMenu}
                                >
                                    {settingsNotSignedIn.map((setting) => (
                                        <MenuItem key={setting} onClick={() => handleMenuItemClick(setting)}>
                                            <Typography textAlign="center" color={theme.palette.text.dark}>
                                                {setting}
                                            </Typography>
                                        </MenuItem>
                                    ))}
                                </Menu>
                            </>
                        )}
                    </Box>
                </Toolbar>
            </Container>
        </AppBar >
    );
};

export default Navbar;