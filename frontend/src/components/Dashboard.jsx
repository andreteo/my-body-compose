import { useTheme } from '@emotion/react';
import { Paper, Box, Container, Grid, IconButton, Tooltip } from '@mui/material';
import React from 'react';
import BluetoothIcon from '@mui/icons-material/Bluetooth';

const Dashboard = () => {
    const theme = useTheme();

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Grid container spacing={3}>
                {/* Chart */}

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
                        test
                        {/* <IconButton onClick={handleBluetoothButton} sx={{ p: 0, color: theme.palette.primary.contrastText }}>
                            <BluetoothIcon />
                        </IconButton> */}
                    </Paper>
                </Grid>
                {/* Recent Deposits */}
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
                {/* Recent Orders */}
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