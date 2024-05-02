import React, { useState, useContext, useEffect } from 'react';
import { ThemeContext } from '../App';
import { AppBar, Toolbar, IconButton, Typography, Menu, Container, Avatar, Button, Tooltip, MenuItem, Box, Switch, useTheme, Divider } from '@mui/material';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import SearchIcon from '@mui/icons-material/Search';
import { useNavigate } from 'react-router-dom';
import UserContext from '../context/user'
import useFetch from '../hooks/useFetch';

const Navbar = (props) => {
    const navigate = useNavigate();
    const theme = useTheme();
    const fetchData = useFetch();
    const settings = ['Profile', 'Logout'];
    const settingsAdmin = ['Admin', 'Profile', 'Logout'];
    const settingsNotSignedIn = ['Login'];
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
                handleLogout();
                break
            case "Profile":
                navigate('/profile');
                break;
            case "Admin":
                navigate('/admin');
                break;
        }
    }

    const handleLogout = async () => {
        const res = await fetchData("/auth/logout", "POST", undefined, localStorage.getItem('accessToken'));

        if (res.ok) {
            localStorage.removeItem('accessToken');
            userCtx.setIsSignedIn(false);
            userCtx.setShowLogin(true);
            userCtx.setUserProfile({});
            navigate('/');
        } else {
            console.error("Logout Failed");
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

                    {userCtx.isUserSignedIn() && (
                        <Tooltip title="Search Users">
                            <IconButton onClick={() => { console.log("TODO: Implement User Search Function") }} sx={{ p: 0, color: theme.palette.primary.contrastText }}>
                                <SearchIcon />
                            </IconButton>
                        </Tooltip>
                    )}
                </Toolbar>

                <Divider orientation='horizontal' variant='middle' flexItem sx={{ backgroundColor: theme.palette.text.primary, borderBottomWidth: "1px" }} />

                <Toolbar disableGutters sx={{ padding: "0 1rem 0 1rem", display: "flex", justifyContent: "flex-end" }}>
                    {userCtx.isUserSignedIn() && (
                        <Box sx={{ display: "flex", justifyContent: "space-evenly", flexGrow: 1 }}>
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

                        {userCtx.isUserSignedIn() && (
                            <>
                                {userCtx.isUserSignedIn() && (
                                    <Tooltip title="User Profile">
                                        <IconButton onClick={(e) => { handleOpenUserMenu(e) }} sx={{ p: 0, color: theme.palette.primary.contrastText }}>
                                            <Avatar src={"data:image/jpeg;base64," + userCtx.userProfile.profile_photo} alt="User Avatar" sx={{ backgroundColor: theme.palette.primary.avatar, color: theme.palette.text.primary }} />
                                        </IconButton>
                                    </Tooltip>
                                )}

                                {!userCtx.isUserSignedIn() && (
                                    <Tooltip title="Not signed in">
                                        <IconButton onClick={(e) => { handleOpenUserMenu(e) }} sx={{ p: 0, color: theme.palette.primary.contrastText }}>
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
                                    {userCtx.userProfile.is_admin && settingsAdmin.map((setting) => (
                                        <MenuItem key={setting} onClick={() => handleMenuItemClick(setting)}>
                                            <Typography
                                                textAlign="center"
                                                color={setting == 'Admin' ? 'red' : theme.palette.text.primary}>
                                                {setting}
                                            </Typography>
                                        </MenuItem>
                                    ))}
                                    {!userCtx.userProfile.is_admin && settings.map((setting) => (
                                        <MenuItem key={setting} onClick={() => handleMenuItemClick(setting)}>
                                            <Typography textAlign="center" color={theme.palette.text.dark}>
                                                {setting}
                                            </Typography>
                                        </MenuItem>
                                    ))}

                                </Menu></>
                        )}

                        {!userCtx.isUserSignedIn() && (
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