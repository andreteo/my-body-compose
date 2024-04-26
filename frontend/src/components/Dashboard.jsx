import { useTheme } from '@emotion/react';
import { Paper, Box, Container, Grid, IconButton, Tooltip } from '@mui/material';
import React, { useContext } from 'react';
import BluetoothIcon from '@mui/icons-material/Bluetooth';
import UserContext from '../context/user'
import UserProfile from './UserProfile';


const Dashboard = () => {
    const theme = useTheme();
    const userCtx = useContext(UserContext);

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Grid container spacing={3}>
                {/* Daily Stuff */}
                <Grid item xs={12} md={8} lg={9}>
                    <Paper
                        sx={{
                            p: 2,
                            display: 'flex',
                            flexDirection: 'column',
                            height: 240,
                            backgroundColor: theme.palette.background.paper
                        }}
                    >

                        <IconButton onClick={() => { console.log('bluetooth') }} sx={{ p: 0, color: theme.palette.primary.contrastText }}>
                            <BluetoothIcon />
                        </IconButton>
                    </Paper>
                </Grid>
                {/* Before/After Photo */}
                <Grid item xs={12} md={4} lg={3}>
                    <Paper
                        sx={{
                            p: 2,
                            display: 'flex',
                            flexDirection: 'column',
                            height: 240,
                        }}
                    >
                        test
                    </Paper>
                </Grid>
                {/* Trends */}
                <Grid item xs={12}>
                    <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
                        test
                    </Paper>
                </Grid>
            </Grid>
        </Container>
    );
};

export default Dashboard;