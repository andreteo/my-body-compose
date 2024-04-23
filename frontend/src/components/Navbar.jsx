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

const Navbar = () => {

    const navigate = useNavigate();
    const theme = useTheme();
    const settings = ['Profile', 'Logout'];
    const [anchorElNav, setAnchorElNav] = useState(null)
    const [anchorElUser, setAnchorElUser] = useState(null);
    const [openDrawer, setOpenDrawer] = useState(false);
    const [drawerList, setDrawerList] = useState(["myDashboard", "myComposition", "myCalories", "myWorkout"]);
    const themeCtx = useContext(ThemeContext);

    const handleOpenNavMenu = (event) => {
        setAnchorElNav(event.current.target);
    };

    const handleCloseNavMenu = () => {
        setAnchorElNav(null);
    };

    const handleOpenUserMenu = (event) => {
        setAnchorElUser(event.currentTarget);
    };

    const handleCloseUserMenu = () => {
        setAnchorElUser(null);
    };

    const handleSwitchChange = () => {
        themeCtx.setDarkMode(prevState => !prevState);
    }

    const handleToggleDrawer = (selection) => {
        setOpenDrawer(selection)
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
                    {/* <Typography>measure: {measurement}</Typography> */}

                    <Tooltip title="Search Users">
                        <IconButton onClick={() => { console.log("TODO: Implement User Search Function") }} sx={{ p: 0, color: theme.palette.primary.contrastText }}>
                            <SearchIcon />
                        </IconButton>
                    </Tooltip>
                </Toolbar>
                <Divider orientation='horizontal' variant='middle' flexItem sx={{ backgroundColor: theme.palette.text.primary, borderBottomWidth: "1px" }} />
                <Toolbar disableGutters sx={{ padding: "0 1rem 0 1rem" }}>
                    <IconButton sx={{ mr: 2, display: { lg: "none", md: "flex", xs: "flex" }, color: theme.palette.text.primary }} size="large" onClick={() => handleToggleDrawer(true)}>
                        {openDrawer ? <MenuOpenIcon /> : <MenuIcon />}
                    </IconButton>

                    <SideDrawer
                        openDrawer={openDrawer}
                        setOpenDrawer={setOpenDrawer}
                        drawerList={drawerList}
                        setDrawerList={setDrawerList}
                        handleToggleDrawer={handleToggleDrawer}>
                    </SideDrawer>


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

                    <Box sx={{ flexGrow: 0 }}>
                        {themeCtx.darkMode && <DarkModeIcon />}
                        {!themeCtx.darkMode && <LightModeIcon />}
                        <Tooltip title='Toggle Light/Dark Mode'>
                            <Switch onChange={handleSwitchChange} color='main' />
                        </Tooltip>
                        <Tooltip title="User Profile">
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
                            {settings.map((setting) => (
                                <MenuItem key={setting} onClick={handleCloseUserMenu}>
                                    <Typography textAlign="center" color={theme.palette.text.dark}>
                                        {setting}
                                    </Typography>
                                </MenuItem>
                            ))}
                        </Menu>

                    </Box>
                </Toolbar>
            </Container>
        </AppBar >
    );
};

export default Navbar;