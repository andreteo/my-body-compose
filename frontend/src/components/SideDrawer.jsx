import React, { useState } from 'react';
import { Box, Drawer, Button, Divider, List, ListItem, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AccessibilityIcon from '@mui/icons-material/Accessibility';
import { useTheme } from '@emotion/react';
import { useNavigate } from 'react-router-dom';

const SideDrawer = (props) => {
    const navigate = useNavigate();
    const theme = useTheme();

    return (
        <div>
            <Drawer open={props.openDrawer} onClose={() => props.handleToggleDrawer(false)}>
                <Box sx={{ width: 250, backgroundColor: theme.palette.primary.main }} role='presentation' onClick={() => props.handleToggleDrawer(false)}>
                    <List>
                        {props.drawerList.map((listItem, idx) => (
                            <ListItem key={idx} disablePadding>
                                {listItem.includes("Composition") &&
                                    <ListItemButton onClick={() => navigate('/composition')}>
                                        <ListItemIcon>
                                            <AccessibilityIcon />
                                        </ListItemIcon>
                                        <ListItemText primary={listItem} />
                                    </ListItemButton>}
                                {listItem.includes("Calories") &&
                                    <ListItemButton onClick={() => navigate('/calories')}>
                                        <ListItemIcon>
                                            <RestaurantIcon />
                                        </ListItemIcon>
                                        <ListItemText primary={listItem} />
                                    </ListItemButton>}
                                {listItem.includes("Dashboard") &&
                                    <ListItemButton onClick={() => navigate('/')}>
                                        <ListItemIcon>
                                            <DashboardIcon />
                                        </ListItemIcon>
                                        <ListItemText primary={listItem} />
                                    </ListItemButton>}
                                {listItem.includes("Workout") &&
                                    <ListItemButton onClick={() => navigate('/workout')}>
                                        <ListItemIcon>
                                            <FitnessCenterIcon />
                                        </ListItemIcon>
                                        <ListItemText primary={listItem} />
                                    </ListItemButton>}
                            </ListItem>
                        ))}
                    </List>
                </Box>
            </Drawer>
        </div>
    );
};

export default SideDrawer;
