import { useTheme } from '@emotion/react';
import { Paper, Box, Container, Grid, IconButton, Tooltip, ImageList, ImageListItem, ImageListItemBar, Typography } from '@mui/material';
import React, { useContext, useEffect, useState } from 'react';
import BluetoothIcon from '@mui/icons-material/Bluetooth';
import UserContext from '../context/user'
import useFetch from '../hooks/useFetch';
import UserGoalsPie from './UserGoalsPie';

const Dashboard = (props) => {
    const theme = useTheme();
    const userCtx = useContext(UserContext);
    const fetchData = useFetch();
    const [photosList, setPhotosList] = useState({
        "before_photo": "",
        "after_photo": "",
    })
    const [userMaxGoals, setUserMaxGoals] = useState({
        "calorie_goal": 0,
        "water_goal": 0,
        "weight_goal": 0
    })


    const [userCurrentGoals, setUserCurrentGoals] = useState({
        "calorie_goal": 0,
        "water_goal": 0,
        "weight_goal": 0
    })

    const getUserPhotos = async () => {
        const userPhotos = await fetchData("/user/profile/photos", "GET", undefined, localStorage.getItem('accessToken'));
        const res = userPhotos.data

        if (res.ok) {
            const user_profile = res.user_photos;
            Object.entries(user_profile).map(([k, v]) => {
                setPhotosList((prevState) => ({
                    ...prevState,
                    [k]: v
                }))
            })
        } else {
            alert(JSON.stringify(userPhotos.data));
        }
    }

    const getUserGoals = async () => {
        const userGoals = await fetchData("/user/profile/goals", "GET", undefined, localStorage.getItem('accessToken'));
        const res = userGoals.data

        if (res.ok) {
            const user_goals = res.user_goals;
            Object.entries(user_goals).map(([k, v]) => {
                setUserMaxGoals((prevState) => ({
                    ...prevState,
                    [k]: v
                }))
            })
        } else {
            alert(JSON.stringify(userGoals.data));
        }
    }

    const getUserRecords = async (recordType) => {
        const url = `/user/records/today?record_type=${recordType}`;
        const response = await fetchData(url, "GET", undefined, localStorage.getItem('accessToken'));
        const data = response.data;

        if (data.ok) {
            const totalRecords = data.user_records;
            switch (recordType) {
                case "hydration":
                    setUserCurrentGoals((prevState) => ({
                        ...prevState,
                        water_goal: totalRecords
                    }));
                    break;
                case "calories":
                    setUserCurrentGoals((prevState) => ({
                        ...prevState,
                        calorie_goal: totalRecords
                    }));
                default:
                    break;
            }
        } else {
            alert(JSON.stringify(data));
        }
    }

    const getHydrationAndCalorieRecords = () => {
        for (const item of ['hydration', 'calories']) {
            getUserRecords(item)
        }
    };

    useEffect(() => {
        getUserPhotos();
        getUserGoals();
        getHydrationAndCalorieRecords();
    }, [])

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Grid container spacing={2}>
                {/* Daily Stuff */}
                <Grid item xs={12}>
                    <Paper
                        id='water_goal'
                        sx={{
                            p: 2,
                            display: 'flex',
                            flexDirection: 'column',
                            backgroundColor: theme.palette.background.paper
                        }}
                    >
                        <UserGoalsPie snackbarOperations={props.snackbarOperations} userCurrentGoals={userCurrentGoals} userMaxGoals={userMaxGoals} getUserRecords={getUserRecords} />

                        {/* {Object.entries(userMaxGoals).map(([k, v]) => (
                            <>
                                <Box>
                                    <Typography>
                                        {k}
                                    </Typography>
                                    <Typography>
                                        {v}
                                    </Typography>
                                </Box>
                            </>
                        ))} */}
                        {/* <IconButton onClick={() => { console.log('bluetooth') }} sx={{ p: 0, color: theme.palette.primary.contrastText }}>
                            <BluetoothIcon />
                        </IconButton> */}
                    </Paper>
                </Grid>

                {/* Before/After Photo */}
                <Grid item xs={7}>
                    <Paper
                        sx={{
                            padding: 2,
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignItems: 'center'
                        }}
                    >
                        <Typography variant='h4' sx={{ m: 2 }}>Your Body Journey</Typography>
                        <ImageList sx={{ width: 600, height: 500 }} cols={2}>
                            {Object.entries(photosList).map(([k, v]) => (
                                <>
                                    {/* before_photo and after_photo exists, render them */}
                                    {v && (
                                        <ImageListItem key={k}>
                                            <img src={"data:image/jpeg;base64," + v} loading='lazy' />
                                            {k == "before_photo" && (
                                                <ImageListItemBar
                                                    alt="before image"
                                                    title="Wake Up Call"
                                                    subtitle={<span>Start of the Journey</span>}
                                                    position="below"
                                                />
                                            )}
                                            {k == "after_photo" && (
                                                <ImageListItemBar
                                                    alt="after image"
                                                    title="Current State"
                                                    subtitle={<span>Latest Journey</span>}
                                                    position="below"
                                                />
                                            )}
                                        </ImageListItem>
                                    )}

                                    {/* If before_photo and after_photo is empty */}
                                    {!v && (
                                        <Paper sx={{ p: 2, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                            No Image
                                        </Paper>
                                    )}
                                </>
                            ))}
                        </ImageList>

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