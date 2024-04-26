import { Button, Container, FormControl, Grid, IconButton, Paper, TextField, Typography } from '@mui/material';
import React, { useContext, useEffect, useState } from 'react';
import { useTheme } from '@emotion/react';
import UserContext from '../context/user'
import EditIcon from '@mui/icons-material/Edit';
import EditOffIcon from '@mui/icons-material/EditOff';
import useFetch from '../hooks/useFetch';
import SaveIcon from '@mui/icons-material/Save';
import SnackbarMessage from './SnackbarMessage';
import ImageUpload from './ImageUpload';

const UserProfile = (props) => {
    const theme = useTheme();
    const userCtx = useContext(UserContext);
    const fetchData = useFetch();
    const [editIndividual, setEditIndividual] = useState({});
    const [upload, setUpload] = useState(true);
    const [photoUpload, setPhotoUpload] = useState(null);

    useEffect(() => {
        getCurrentUserProfile();
    }, [])

    useEffect(() => {
        sortObjectByKey(userCtx.userProfile);
    }, [userCtx.userProfile]);

    useEffect(() => {
        const temp = {}
        const arr = userCtx.userProfile ? Object.keys(userCtx.userProfile) : [];

        arr.forEach(key => {
            temp[key] = false;
        });

        setEditIndividual(temp);
    }, [])

    const sortObjectByKey = (unorderedObj) => {
        Object.keys(unorderedObj).sort().reduce(
            (obj, key) => {
                obj[key] = unorderedObj[key];
                return obj;
            },
            {}
        );
    }


    const getCurrentUserProfile = async () => {
        const userProfileReturned = await fetchData("/user/profile", "GET", undefined, userCtx.accessToken);
        const res = userProfileReturned.data

        if (res.ok) {
            const user_profile = res.user_profile;
            // setCurrentUserProfile(user_profile);
            userCtx.setUserProfile(user_profile)
        } else {
            alert(JSON.stringify(userProfileReturned.data));
        }
    }

    const handleEdit = (k) => {
        setEditIndividual(prevState => ({
            ...prevState,
            [k]: !prevState[k]
        }))
    }

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        userCtx.setUserProfile(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleSubmitInputChange = async () => {
        const res = await fetchData("/user/profile/edit", "POST", userCtx.userProfile, userCtx.accessToken);

        if (!res.ok) {
            alert(`Failed to edit!\n Error: ${res.data}`);
        } else {
            getCurrentUserProfile();
            props.snackbarOperations.setSnackbarMessage(`Edit Success!`);
            props.snackbarOperations.setSnackbarOpen(true);
        }
    }


    return (

        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Paper
                sx={{
                    p: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    backgroundColor: theme.palette.background.paper
                }}
            >
                <SnackbarMessage
                    open={props.snackbarOperations.snackbarOpen}
                    message={props.snackbarOperations.snackbarMessage}
                    vertical="bottom"
                    horizontal="center"
                    setSnackbarOpen={props.snackbarOperations.setSnackbarOpen}
                    setSnackbarMessage={props.snackbarOperations.setSnackbarMessage}>
                </SnackbarMessage>

                <Grid container spacing={1} alignItems="center">
                    <Grid item xs={12}>
                        <Typography variant="h4">User Profile</Typography>
                    </Grid>

                    {Object.entries(userCtx.userProfile).map(([k, v]) => {
                        if (k == 'profile_id') return null;

                        const itemText = k.replaceAll("_", " ");

                        return (
                            <Grid container key={k + "whatever"} sx={{ padding: 1 }}>
                                <Grid item xs={2}>
                                    <Typography variant="h5">{itemText}</Typography>
                                </Grid>

                                {!editIndividual[k] && (
                                    <>
                                        <Grid item xs={8}>
                                            {!itemText.includes('photo') && (
                                                <Typography variant="h6">{v}</Typography>

                                            )}
                                            {itemText.includes('photo') && (
                                                <>
                                                    {userCtx.userProfile[k] ? (
                                                        <img src={"data:image/jpeg;base64," + userCtx.userProfile[k]} height={"200px"} alt={itemText} />
                                                    ) : (
                                                        <Typography sx={{ color: 'red' }}>No Image</Typography>
                                                    )}
                                                </>
                                            )}

                                        </Grid>

                                        <Grid item xs={2}>
                                            <IconButton onClick={() => handleEdit(k)} sx={{ p: 0, color: theme.palette.primary.contrastText }}>
                                                <EditIcon />
                                            </IconButton>
                                        </Grid>

                                    </>
                                )}

                                {editIndividual[k] && (
                                    <>
                                        {itemText.includes('photo') && (
                                            <Grid item xs={8}>
                                                <ImageUpload
                                                    upload={upload}
                                                    setUpload={setUpload}
                                                    setPhotoUpload={setPhotoUpload}
                                                    setUserRegistrationState={userCtx.setUserProfile}
                                                    photoKey={k}>
                                                </ImageUpload>
                                            </Grid>
                                        )}
                                        {!itemText.includes('photo') && (
                                            <>
                                                <Grid item xs={8}>
                                                    <FormControl margin="normal" fullWidth>
                                                        <TextField
                                                            variant='standard'
                                                            color="success"
                                                            required
                                                            name={k}
                                                            label={[itemText.charAt(0).toUpperCase(), itemText.slice(1)].join('')}
                                                            id={k}
                                                            autoFocus
                                                            onChange={handleInputChange}
                                                            value={userCtx.userProfile[k]} // Bind value to currentUserPRofile state
                                                        />
                                                    </FormControl>
                                                </Grid>
                                            </>
                                        )}
                                        <Grid item xs={1}>
                                            <IconButton onClick={() => handleEdit(k)} sx={{ p: 0, color: theme.palette.primary.contrastText }}>
                                                <EditOffIcon />
                                            </IconButton>
                                        </Grid>
                                        <Grid item xs={1}>
                                            <IconButton onClick={() => {
                                                handleSubmitInputChange();
                                                handleEdit(k)
                                            }} sx={{ p: 0, color: theme.palette.primary.contrastText }}>
                                                <SaveIcon />
                                            </IconButton>
                                        </Grid>
                                    </>
                                )}
                            </Grid>
                        )
                    })}
                </Grid>
            </Paper>
        </Container>

    );
};

export default UserProfile;